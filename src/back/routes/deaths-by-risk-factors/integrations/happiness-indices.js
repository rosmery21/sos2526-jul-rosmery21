const API_URL = "https://sos2526-15.onrender.com/api/v2/happiness-indices";

export const getHappinessIndices = async () => {
    try {
        let response = await fetch(API_URL);

        if (!response.ok) throw new Error(`Hapsiness-indices api error: ${response.status}`);

        let data = await response.json();

        if (data.length === 0){
            console.log("Loading happiness indices api initial data...");

            await fetch(`${API_URL}/loadInitialData`);
            response = await fetch(API_URL);
            data = await response.json();
        }

        return data;
    } catch (error) {
        console.error("Error importando la API de indices de felicidad:", error);
        return [];
    }
}