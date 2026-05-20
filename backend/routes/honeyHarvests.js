const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'honey_harvests',
  fields: ['harvest_id','hive_id','kg','type','harvested_at','status','notes'],
});
