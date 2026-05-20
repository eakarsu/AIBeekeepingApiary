const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'inspections',
  fields: ['inspection_id','hive_id','inspector','date','brood_pattern','health','notes'],
});
