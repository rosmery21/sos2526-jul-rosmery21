export const getWorldbankGDP = async () => {
    try {
        const url = 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=300&mrv=1';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`WorldBank GDP error: ${response.status}`);
        const data = await response.json();
        // data[1] contains the actual records
        return (data[1] || []).filter(d => d.value !== null).map(d => ({
            country: d.country.value,
            countryCode: d.countryiso3code,
            year: d.date,
            gdpPerCapita: d.value
        }));
    } catch (error) {
        console.error('Error fetching WorldBank GDP:', error);
        return [];
    }
};
