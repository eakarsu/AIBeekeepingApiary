const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'hive_sounds',
  fields: ['sound_id','hive_id','recording_url','captured_at','classification','confidence','notes'],
});
