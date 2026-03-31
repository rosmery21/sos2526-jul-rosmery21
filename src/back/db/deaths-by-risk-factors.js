import dataStore from 'nedb';

const store = new dataStore({filename: './data/storage/deaths-by-risk-factors.db', autoload: true});

export default store;