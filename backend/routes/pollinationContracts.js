const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'pollination_contracts',
  fields: ['contract_id','customer_id','crop','hives_committed','fee_usd','status','notes'],
});
