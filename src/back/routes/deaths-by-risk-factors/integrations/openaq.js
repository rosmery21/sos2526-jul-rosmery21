import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAQ_API_KEY;

export async function getOpenAQData(countryName) {
  try {
    // Aumentamos el límite considerablemente para que el frontend 
    // tenga de dónde filtrar estaciones del país seleccionado
    const res = await fetch("https://api.openaq.org/v3/locations?limit=1000", {
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