import express from "express";

const router = express.Router();
const API_URL = "https://pokeapi.co/api/v2/pokemon/";

router.get("/pokeapi", async (req, res) => {
    try {
        const response = await fetch(API_URL + "?limit=100000");
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/pokeapi/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const response = await fetch(
      `${API_URL}/${name}`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Pokemon not found"
      });
    }

    const data = await response.json();

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.get("/social-drinking", async (req, res) => {
    try {
        const response = await fetch("https://sos2526-25.onrender.com/api/v2/social-drinking-behaviors/");
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;