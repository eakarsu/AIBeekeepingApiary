const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'treatments',
  fields: ['treatment_id','hive_id','product','dosage','applied_at','status','notes','label_id'],
});
