const data = require('./test/api/SMJ/test-SMJ.json');
const folder = data.item[0];
console.log('items:', folder.item.length);
folder.item.forEach((item,i) => console.log(i, item.name, 'hasItem:', !!item.item, 'hasRequest:', !!item.request));
