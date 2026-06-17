import express from "express";
import fs from "fs";
import path from "path";
import Datastore from "nedb-promises";

const router = express.Router();

/* DATABASE */
const store = Datastore.create({
  filename: "./data/storage/child-malnutritions.db",
  autoload: true
});

/* LOAD CSV + INSERT INTO DB */
router.get("/child-malnutritions/loadInitialData", async (req, res) => {
  try {
    const count = await store.count({});

    if (count > 0) {
      return res.status(409).send("Already loaded");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "datasets",
      "child-malnutritions.csv"
    );

    const content = fs.readFileSync(filePath, "utf-8");

    const lines = content
      .split("\n")
      .filter(l => l.trim() !== "")
      .slice(1);

    const data = lines.map(line => {
      const col = line.split(",");

      return {
        year: Number(col[0]),
        country: col[1]?.trim(),
        region: col[2]?.trim(),
        stunting_rate: Number(col[3]) || 0,
        wasting_rate: Number(col[4]) || 0,
        overweight_rate: Number(col[5]) || 0,
        underweight_rate: Number(col[6]) || 0
      };
    });

    await store.insert(data);

    return res.status(200).send("Loaded");

  } catch (err) {
    return res.status(500).send("CSV error: " + err.message);
  }
});

/* GET ALL */
router.get("/child-malnutritions", async (req, res) => {
  try {
    const { limit, offset, country, region, from, to } = req.query;

    let data = await store.find({});

    if (country) {
      data = data.filter(d =>
        d.country.toLowerCase().includes(country.toLowerCase())
      );
    }

    if (region) {
      data = data.filter(d =>
        d.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    if (req.query.year) {
      data = data.filter(d => d.year === Number(req.query.year));
    }

    if (from) {
      data = data.filter(d => d.year >= Number(from));
    }

    if (to) {
      data = data.filter(d => d.year <= Number(to));
    }

    if (req.query.stunting_rate) {
      const val = Number(req.query.stunting_rate);
      data = data.filter(d => d.stunting_rate === val);
    }
    if (req.query.wasting_rate) {
      const val = Number(req.query.wasting_rate);
      data = data.filter(d => d.wasting_rate === val);
    }
    if (req.query.overweight_rate) {
      const val = Number(req.query.overweight_rate);
      data = data.filter(d => d.overweight_rate === val);
    }
    if (req.query.underweight_rate) {
      const val = Number(req.query.underweight_rate);
      data = data.filter(d => d.underweight_rate === val);
    }

    const L = limit ? Number(limit) : data.length;
    const O = offset ? Number(offset) : 0;

    return res.status(200).json(data.slice(O, O + L));

  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/* GET ONE */
router.get("/child-malnutritions/:country/:year", async (req, res) => {
  try {
    const { country, year } = req.params;

    const data = await store.findOne({
      country: new RegExp(`^${country}$`, "i"),
      year: Number(year)
    });

    if (!data) {
      return res.status(404).send("Not found");
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/* POST */
router.post("/child-malnutritions", async (req, res) => {
  try {
    const body = req.body;

    if (!body.year || !body.country || !body.region) {
      return res.status(400).send("Bad request");
    }

    const exists = await store.findOne({
      country: new RegExp(`^${body.country}$`, "i"),
      year: Number(body.year)
    });

    if (exists) {
      return res.status(409).send("Conflict");
    }

    await store.insert({
      year: Number(body.year),
      country: body.country,
      region: body.region,
      stunting_rate: body.stunting_rate || 0,
      wasting_rate: body.wasting_rate || 0,
      overweight_rate: body.overweight_rate || 0,
      underweight_rate: body.underweight_rate || 0
    });

    return res.status(201).send("Created");

  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/* DELETE ALL */
router.delete("/child-malnutritions", async (req, res) => {
  await store.remove({}, { multi: true });
  return res.status(200).send("Deleted");
});

/* DELETE ONE */
router.delete("/child-malnutritions/:country/:year", async (req, res) => {
  const removed = await store.remove(
    {
      country: new RegExp(`^${req.params.country}$`, "i"),
      year: Number(req.params.year)
    },
    { multi: true }
  );

  if (removed === 0) {
    return res.status(404).send("Not found");
  }

  return res.status(204).send();
});

/* PUT */
router.put("/child-malnutritions/:country/:year", async (req, res) => {
  const { country, year } = req.params;
  const body = req.body;

  if (
    body.country?.toLowerCase() !== country.toLowerCase() ||
    Number(body.year) !== Number(year)
  ) {
    return res.status(400).send("ID mismatch");
  }

  const updated = await store.update(
    {
      country: new RegExp(`^${country}$`, "i"),
      year: Number(year)
    },
    {
      $set: {
        country: body.country,
        year: Number(body.year),
        region: body.region,
        stunting_rate: body.stunting_rate,
        wasting_rate: body.wasting_rate,
        overweight_rate: body.overweight_rate,
        underweight_rate: body.underweight_rate
      }
    }
  );

  if (updated === 0) {
    return res.status(404).send("Not found");
  }

  return res.status(200).send("Updated");
});

export default router;
