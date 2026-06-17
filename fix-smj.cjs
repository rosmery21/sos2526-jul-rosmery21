const fs = require('fs');
const data = require('./test/api/SMJ/test-SMJ.json');
const folder = data.item[0];

// Sostituiamo il RESET con uno che cancella Spain/2025
folder.item[0] = {
  name: 'RESET - Delete Spain/2025',
  request: {
    method: 'DELETE',
    header: [],
    url: {
      raw: '{{BASE_URL}}{{BASE_API_URL}}/deaths-by-risk-factors/Spain/2025',
      host: ['{{BASE_URL}}{{BASE_API_URL}}'],
      path: ['deaths-by-risk-factors', 'Spain', '2025']
    }
  },
  response: []
};

fs.writeFileSync('./test/api/SMJ/test-SMJ.json', JSON.stringify(data, null, 2));
console.log('Done!');
