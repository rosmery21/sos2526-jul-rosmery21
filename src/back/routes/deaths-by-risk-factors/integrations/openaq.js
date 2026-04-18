import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAQ_API_KEY;

export async function getOpenAQData() {
  try {
    const res = await fetch("https://api.openaq.org/v3/locations", {
      headers: {
        "X-API-Key": API_KEY || "" // Evita que sea undefined
      }
    });
    if (!res.ok) throw new Error(`OpenAQ error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error en fetch OpenAQ:", err);
    throw err; // Re-lanzar para que el router lo capture
  }
}