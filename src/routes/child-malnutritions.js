import express from "express";
const router = express.Router();

let childMalnutritions = [
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
];

router.get("/child-malnutritions", (req, res) => {
    res.send(childMalnutritions);
});

export default router;