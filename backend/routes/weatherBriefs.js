const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'weather_briefs',
  fields: ['brief_id','location','valid_at','temperature_c','wind_kt','forecast','notes'],
});
