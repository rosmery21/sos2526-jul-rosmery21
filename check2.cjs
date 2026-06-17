const data = require('./test/api/SMJ/test-SMJ.json');
const folder = data.item[0];
const reset = folder.item[0];
console.log('RESET request:', JSON.stringify(reset.request, null, 2));
