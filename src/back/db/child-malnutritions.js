import Datastore from "nedb-promises";

const store = Datastore.create({
 filename:"./data/storage/child-malnutritions.db",
 autoload:true
});

export default store;