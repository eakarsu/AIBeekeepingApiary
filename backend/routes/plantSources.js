const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'plant_sources',
  fields: ['source_id','common_name','distance_km','blooms_at','nectar_yield','status','notes'],
});
