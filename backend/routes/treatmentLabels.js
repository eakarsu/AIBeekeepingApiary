const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'treatment_labels',
  fields: [
    'label_id',
    'product',
    'active_ingredient',
    'manufacturer',
    'epa_reg_no',
    'withdrawal_days_honey',
    'reentry_interval_hours',
    'approved_temp_range_c',
    'resistance_class',
    'notes',
  ],
});
