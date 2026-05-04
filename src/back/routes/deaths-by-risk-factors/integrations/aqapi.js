export async function getAQapiData(countryCode) {
  try {
    let url = `https://ghoapi.azureedge.net/api/AIR_41?$filter=SpatialDim eq '${countryCode}'`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AQapi error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error en fetch AQapi:", err);
    throw err;
  }
}