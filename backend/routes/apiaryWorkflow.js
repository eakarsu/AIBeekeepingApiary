const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');
const { validateInspection, buildApiaryDraft } = require('../domain/apiaryWorkflow');

const router = express.Router();

router.post('/inspections', requireWriter, async (req, res) => {
  const errors = validateInspection(req.body);
  if (errors.length) return res.status(400).json({ error: 'validation_failed', details: errors });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hive = await client.query('SELECT hive_id FROM hives WHERE hive_id=$1', [req.body.hive_id]);
    if (!hive.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'hive_not_found' }); }
    const previous = await client.query('SELECT p.* FROM inspection_workflow_events e JOIN apiary_action_plans p ON p.inspection_event_id=e.id WHERE e.source_event_id=$1', [req.body.source_event_id]);
    if (previous.rows.length) { await client.query('ROLLBACK'); return res.json({ plan: previous.rows[0], idempotent_replay: true }); }
    const draft = buildApiaryDraft(req.body);
    const event = await client.query(
      `INSERT INTO inspection_workflow_events (hive_id,source_event_id,inspected_at,provenance,findings,created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.body.hive_id, req.body.source_event_id, req.body.inspected_at, req.body.provenance, req.body.findings, req.user.email]
    );
    const plan = await client.query('INSERT INTO apiary_action_plans (inspection_event_id,ruleset_version,decision) VALUES ($1,$2,$3) RETURNING *', [event.rows[0].id, draft.ruleset_version, draft]);
    for (const task of draft.tasks) await client.query('INSERT INTO apiary_action_tasks (plan_id,task_type,priority) VALUES ($1,$2,$3)', [plan.rows[0].id, task.type, task.priority]);
    await client.query('COMMIT');
    res.status(201).json({ inspection: event.rows[0], plan: plan.rows[0], draft, warning: 'No treatment, hive movement, or equipment action was executed.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('apiary workflow failed:', error);
    res.status(500).json({ error: 'workflow_failed' });
  } finally { client.release(); }
});

router.post('/plans/:id/approve', requireWriter, async (req, res) => {
  const result = await pool.query(
    `UPDATE apiary_action_plans SET status='approved', approved_by=$1, approved_at=NOW()
     WHERE id=$2 AND status='draft' RETURNING *`,
    [req.user.email, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'draft_plan_not_found' });
  await pool.query("UPDATE apiary_action_tasks SET status='approved' WHERE plan_id=$1 AND status='proposed'", [req.params.id]);
  res.json({ plan: result.rows[0], warning: 'Approval schedules review tasks only; treatment selection and application remain outside this software boundary.' });
});

module.exports = router;
