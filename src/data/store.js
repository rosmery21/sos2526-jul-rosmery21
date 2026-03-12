import Nedb from 'nedb';

/*
 This object is used to store the data in memory
 from the different routes to make it accesible 
 and persistent across the different routes and modules.
 */
/*
export const store = {
    pandemics: [],
    protests: [],
    deathsByRiskFactors: []
};*/

const store = new Nedb();

const pandemics = [];
const protests = [];
const deathsByRiskFactors = [];

//store.insert(pandemics);
//store.insert(protests);
store.insert(deathsByRiskFactors);

export { store };