export async function getPopulationData(country) {
    const url = `https://restcountries.com/v3.1/name/${country}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("País no encontrado en la API externa");
        }
        const data = await response.json();
        return data; // Devolvemos los datos
    } catch (err) {
        console.error("Error en getPopulationData:", err.message);
        throw err;
    }
}