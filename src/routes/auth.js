const express = require('express');
const router = express.Router();

// Simulated login state
global.login = false;

router.get('/login', (req, res) => {
  login = true;
  res.status(200).send('Login successful');
});
router.get('/logout', (req, res) => {
  login = false;
  res.status(200).send('Logout successful');
});

module.exports = router;