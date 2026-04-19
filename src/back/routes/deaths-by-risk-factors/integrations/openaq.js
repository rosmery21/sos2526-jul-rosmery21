import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAQ_API_KEY;

export async function getOpenAQData(countryCode) {
  try {
    let url = `https://api.openaq.org/v3/locations?countries_id=${countryCode}&parameters_id=2`;
    const res = await fetch(url, {
      headers: {
        "X-API-Key": API_KEY || ""
      }
    });
    if (!res.ok) throw new Error(`OpenAQ error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error en fetch OpenAQ:", err);
    throw err;
  }
}