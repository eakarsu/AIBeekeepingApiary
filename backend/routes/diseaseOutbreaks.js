const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'disease_outbreaks',
  fields: ['outbreak_id','apiary_id','disease','severity','opened_at','status','notes'],
});
