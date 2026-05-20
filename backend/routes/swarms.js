const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'swarms',
  fields: ['swarm_id','source_hive','location','caught_at','status','captured_by','notes'],
});
