const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'queens',
  fields: ['queen_id','hive_id','breed','year','marked','status','notes'],
});
