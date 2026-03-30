const { initFdmSchema } = require('../connection');
const { seedFdm } = require('./fdm_seed');
const { seedScm } = require('./scm_seed');

console.log('Initializing FDM schema...');
initFdmSchema();
console.log('Seeding FDM...');
seedFdm();
console.log('Seeding SCM...');
seedScm();
console.log('Done!');
