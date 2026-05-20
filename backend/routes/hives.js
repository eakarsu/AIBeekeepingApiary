const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'hives',
  fields: ['hive_id','apiary_id','queen_id','frame_count','last_inspection','status','notes'],
});
