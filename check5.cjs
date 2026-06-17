const data = require('./test/api/SMJ/test-SMJ.json');
const folder = data.item[0];
const postFolder = folder.item[1];
console.log('POST items:');
postFolder.item.forEach((item,i) => {
  console.log(i, item.name, JSON.stringify(item.request?.url?.raw), JSON.stringify(item.request?.body?.raw?.substring(0,80)));
});
