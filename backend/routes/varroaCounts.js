const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'varroa_counts',
  fields: ['count_id','hive_id','mites_per_100_bees','sampled_at','status','action','notes'],
});
