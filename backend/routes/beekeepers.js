const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'beekeepers',
  fields: ['beekeeper_id','name','certifications','base','hives_managed','status','notes'],
});
