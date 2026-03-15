import express from "express";
const router = express.Router();

let childMalnutritions = [];

// GET all data
router.get("/child-malnutritions", (req, res) => {
    res.send(childMalnutritions);
});

// GET single data
router.get("/child-malnutritions/:country/:year",(req,res)=>{

const country=req.params.country;
const year=parseInt(req.params.year);

const data=childMalnutritions.find(d=>d.country===country && d.year===year);

if(!data){
res.status(404).json({error:"Not found"});
}else{
res.send(data);
}

});

// load initial data
router.get("/child-malnutritions/loadInitialData",(req,res)=>{

if(childMalnutritions.length===0){

childMalnutritions.push(
{year:2015,country:"Peru",region:"South America",stunting_rate:13.2},
{year:2016,country:"Peru",region:"South America",stunting_rate:12.9},
{year:2017,country:"Peru",region:"South America",stunting_rate:12.3},
{year:2018,country:"Bolivia",region:"South America",stunting_rate:16.5},
{year:2019,country:"Bolivia",region:"South America",stunting_rate:16.1},
{year:2020,country:"Bolivia",region:"South America",stunting_rate:15.8},
{year:2021,country:"Ecuador",region:"South America",stunting_rate:14.2},
{year:2022,country:"Ecuador",region:"South America",stunting_rate:13.9},
{year:2023,country:"Peru",region:"South America",stunting_rate:11.8},
{year:2024,country:"Peru",region:"South America",stunting_rate:11.5}
);

res.status(201).send("Initial data loaded");

}else{

res.status(200).send("Data already loaded");

}

});
router.post("/child-malnutritions",(req,res)=>{

const newData=req.body;

childMalnutritions.push(newData);

res.status(201).send("Created");

});
router.delete("/child-malnutritions",(req,res)=>{

childMalnutritions=[];

res.status(200).send("All data deleted");

});
router.delete("/child-malnutritions/:country/:year",(req,res)=>{

const country=req.params.country;
const year=parseInt(req.params.year);

const index=childMalnutritions.findIndex(d=>d.country===country && d.year===year);

if(index===-1){
res.status(404).send("Not found");
}else{

childMalnutritions.splice(index,1);
res.status(200).send("Deleted");

}

});

router.put("/child-malnutritions/:country/:year",(req,res)=>{

const country=req.params.country;
const year=parseInt(req.params.year);

const index=childMalnutritions.findIndex(
d=> d && d.country===country && d.year===year
);

if(index===-1){

res.status(404).send("Not found");

}else{

childMalnutritions[index]=req.body;
res.status(200).send("Updated");

}

});

export default router;