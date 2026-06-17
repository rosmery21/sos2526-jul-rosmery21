const data = require('./test/api/SMJ/test-SMJ.json');
const folder = data.item[0];
const deleteFolder = folder.item[4];
console.log('DELETE items URL:', JSON.stringify(deleteFolder.item[0].request.url, null, 2));
