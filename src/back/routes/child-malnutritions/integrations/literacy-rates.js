const API_URL = 'https://sos2526-11.onrender.com/api/v1/literacy-rates';

export const getLiteracyRates = async () => {
    try {
        await fetch(API_URL + "/loadInitialData").catch(() => {});
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Literacy-rates API error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching literacy-rates:', error);
        return [];
    }
};
