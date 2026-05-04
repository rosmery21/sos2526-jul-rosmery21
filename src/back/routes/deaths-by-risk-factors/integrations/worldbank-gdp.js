
export async function getWorldbankGDP(countryCode) {
    try {
        let url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?date=2000:2024&format=json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`WorldBank GDP error: ${response.status}`);
        let data = await response.json();

        return data[1];
    } catch (err) {
        console.error("Error en fetch Worldbank GDP:", err);
        throw err;
    }
};

export async function getWorldbankCountries() {
    try {
        const url = "https://api.worldbank.org/v2/country?format=json&per_page=300";
        const response = await fetch(url);

        const data = await response.json();
        const countries = data[1].filter(c => c.capitalCity !== "");
        return countries;
    } catch (err) {
        console.error("Error en fetch Worldbank countries:", err);
        throw err
    }
};