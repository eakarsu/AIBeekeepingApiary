const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'apiaries',
  fields: ['apiary_id','name','location','hive_count','owner','status','notes'],
});
