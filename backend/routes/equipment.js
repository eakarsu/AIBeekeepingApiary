const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'equipment',
  fields: ['eq_id','type','sn','location','last_service','status','notes'],
});
