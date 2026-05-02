export async function getWorldData(country) {
    const url = `https://covid-19-by-api-ninjas.p.rapidapi.com/v1/covid19?country=${country}`;
    
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'ad97ef76e3msh2b781eca540599ep19e5fajsn89a7953f8f31',
            'X-RapidAPI-Host': 'covid-19-by-api-ninjas.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error en la API de API-Ninjas: ${response.status}`);
        }
        const data = await response.json();
        return data; 
    } catch (err) {
        console.error("Error en getWorldData:", err.message);
        throw err;
    }
}