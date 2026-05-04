
export async function getWorldbankGDP(countryCode) {
    try {
        let url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?date=2000:2024&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`WorldBank GDP error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Error en fetch Worldbank GDP:", err);
        throw err;
    }
};