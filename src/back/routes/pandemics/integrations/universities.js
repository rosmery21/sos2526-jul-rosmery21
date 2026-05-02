export async function getUniversitiesData(country) {
    const url = `http://universities.hipolabs.com/search?country=${country}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en la API de universidades");
        const data = await response.json();
        return data; 
    } catch (err) {
        console.error("Error en getUniversitiesData:", err.message);
        throw err;
    }
}