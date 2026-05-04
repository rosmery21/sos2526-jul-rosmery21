const API_URL = "https://sos2526-18.onrender.com/api/v1/cost-of-healthy-diet-by-countries";

export const getDietCost = async () => {
    try {
        let response = await fetch(API_URL);

        if (!response.ok) throw new Error(`Cost-of-health-diet error: ${response.status}`);

        let data = await response.json();

        if (data.length === 0){
            console.log("Loading diet cost api initial data...");

            await fetch(`${API_URL}/loadInitialData`);
            response = await fetch(API_URL);
            data = await response.json();
        }

        return data.map(item => ({
            ...item,
            country: item.country.split(',')[0].trim()
        }));
    } catch (error) {
        console.error("Error importando la API de coste de dieta saludable:", error);
        return [];
    }
};