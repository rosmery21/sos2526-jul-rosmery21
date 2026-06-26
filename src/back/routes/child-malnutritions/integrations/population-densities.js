const API_URL = 'https://sos2526-15.onrender.com/api/v1/population-densities';

export const getPopulationDensities = async () => {
    try {
        await fetch(API_URL + "/loadInitialData").catch(() => {});
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Population-densities API error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching population-densities:', error);
        return [];
    }
};
