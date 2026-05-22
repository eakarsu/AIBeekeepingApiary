// Queens CRUD + lineage traversal.
// Lineage uses `queens.notes` JSON-ish convention: lines with "mother=<queen_id>"
// establish parent linkage. We support both: explicit notes mention and a
// fallback to traversing hive_id matches between queen rows.

const express = require('express');
const buildCrud = require('./_crudFactory');
const pool = require('../config/database');

const innerCrud = buildCrud({
  table: 'queens',
  fields: ['queen_id', 'hive_id', 'breed', 'year', 'marked', 'status', 'notes'],
});

const outer = express.Router();

function parseMotherId(notes) {
  if (!notes || typeof notes !== 'string') return null;
  const m = notes.match(/mother\s*=\s*([A-Za-z0-9_-]+)/i);
  return m ? m[1] : null;
}

outer.get('/:id/lineage', async (req, res) => {
  try {
    // :id can be the surrogate id or the queen_id.
    const r = await pool.query(
      'SELECT * FROM queens WHERE id::text = $1 OR queen_id = $1 LIMIT 1',
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'queen not found' });
    const root = r.rows[0];

    const all = (await pool.query('SELECT * FROM queens')).rows;
    const byQid = new Map(all.map((q) => [q.queen_id, q]));

    // Ancestors via "mother=<qid>" in notes.
    const ancestors = [];
    let cur = root;
    const seen = new Set();
    while (cur && !seen.has(cur.queen_id)) {
      seen.add(cur.queen_id);
      const mid = parseMotherId(cur.notes);
      if (!mid) break;
      const m = byQid.get(mid);
      if (!m) break;
      ancestors.push(m);
      cur = m;
    }

    // Daughters: queens whose notes mother=<root.queen_id>.
    const daughters = all.filter(
      (q) => parseMotherId(q.notes) === root.queen_id && q.queen_id !== root.queen_id
    );

    // Inbreeding flag: shared ancestor within 3 generations between
    // any two daughters.
    function ancestorChain(qid) {
      const chain = [];
      let c = byQid.get(qid);
      const s = new Set();
      while (c && !s.has(c.queen_id) && chain.length < 8) {
        s.add(c.queen_id);
        const mid = parseMotherId(c.notes);
        if (!mid) break;
        chain.push(mid);
        c = byQid.get(mid);
      }
      return chain;
    }
    let inbreeding = false;
    for (let i = 0; i < daughters.length; i++) {
      for (let j = i + 1; j < daughters.length; j++) {
        const ai = ancestorChain(daughters[i].queen_id).slice(0, 3);
        const aj = ancestorChain(daughters[j].queen_id).slice(0, 3);
        if (ai.some((x) => aj.includes(x))) { inbreeding = true; break; }
      }
      if (inbreeding) break;
    }

    // Hygienic-trait lineage marker: presence of "hygienic" in notes path.
    const hygienicLineage =
      [root, ...ancestors, ...daughters].some(
        (q) => q.notes && /hygienic/i.test(q.notes)
      );

    res.json({
      root: { queen_id: root.queen_id, breed: root.breed, year: root.year, hive_id: root.hive_id },
      ancestors: ancestors.map((q) => ({
        queen_id: q.queen_id, breed: q.breed, year: q.year, hive_id: q.hive_id,
      })),
      daughters: daughters.map((q) => ({
        queen_id: q.queen_id, breed: q.breed, year: q.year, hive_id: q.hive_id,
      })),
      inbreeding_flag: inbreeding,
      hygienic_trait_lineage: hygienicLineage,
      generations_traced: ancestors.length,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

outer.use(innerCrud);

module.exports = outer;
