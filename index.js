import express from 'express';
import deathsRoute from './src/back/deaths-by-risk-factors.js';
import protestsRoute from './src/back/protests.js';
import pandemicsRoute from './src/back/pandemics.js';
import childMalnutritions from "./src/back/child-malnutritions.js";

import { handler as svelteHandler } from './src/front/build/handler.js';

const app = express();

app.use(express.json());
//app.use("/", express.static("./src/front/build"));
//app.use("/", express.static("./public"));

app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    if (req.get("Content-Type") && !req.is("application/json")) {
      return res.status(415).send("Unsupported Media Type: Only JSON allowed");
    }
  }
  next();
});

const BASE_API_URL = '/api/v1';
const PORT = process.env.PORT || 3000;

app.use(BASE_API_URL, deathsRoute);
app.use(BASE_API_URL, protestsRoute);
app.use(BASE_API_URL, pandemicsRoute);
app.use(BASE_API_URL, childMalnutritions);

/* ROUTE SAMPLE F04 */

app.get("/samples/rm", (req, res) => {

  const data = [13.2, 12.9, 12.3];
  const avg = data.reduce((a, b) => a + b, 0) / data.length;


  res.send("Average stunting rate: " + avg.toFixed(1));

});

app.use(svelteHandler);

/* START SERVER */
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));