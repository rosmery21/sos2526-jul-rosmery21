export const getWorldbankLifeExpectancy = async () => {
    try {
        const url = 'https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&per_page=300&mrv=1';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`WorldBank Life Expectancy error: ${response.status}`);
        const data = await response.json();
        return (data[1] || []).filter(d => d.value !== null).map(d => ({
            country: d.country.value,
            countryCode: d.countryiso3code,
            year: d.date,
            lifeExpectancy: d.value
        }));
    } catch (error) {
        console.error('Error fetching WorldBank Life Expectancy:', error);
        return [];
    }
};
