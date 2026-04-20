<head>
<script src="https://code.highcharts.com/maps/highmaps.js"></script>
<script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
<script src="https://code.highcharts.com/maps/modules/data.js"></script>
<script src="https://code.highcharts.com/maps/modules/accessibility.js"></script>
<script src="https://code.highcharts.com/themes/adaptive.js"></script>
</head>

<div id="container"></div>

<script>
(async () => {
    try {
        // Country name to ISO-3 code mapping
        const countryToISO = {
            'Aruba': 'ABW',
            'Afghanistan': 'AFG',
            'Angola': 'AGO',
            'Albania': 'ALB',
            'Andorra': 'AND',
            'United Arab Emirates': 'ARE',
            'Argentina': 'ARG',
            'Armenia': 'ARM',
            'Antigua and Barbuda': 'ATG',
            'Australia': 'AUS',
            'Austria': 'AUT',
            'Azerbaijan': 'AZE',
            'Burundi': 'BDI',
            'Belgium': 'BEL',
            'Benin': 'BEN',
            'Burkina Faso': 'BFA',
            'Bangladesh': 'BGD',
            'Bulgaria': 'BGR',
            'Bahrain': 'BHR',
            'Bahamas, The': 'BHS',
            'Bahamas': 'BHS',
            'Bosnia and Herzegovina': 'BIH',
            'Belarus': 'BLR',
            'Belize': 'BLZ',
            'Bermuda': 'BMU',
            'Bolivia': 'BOL',
            'Brazil': 'BRA',
            'Barbados': 'BRB',
            'Brunei Darussalam': 'BRN',
            'Bhutan': 'BTN',
            'Botswana': 'BWA',
            'Central African Republic': 'CAF',
            'Canada': 'CAN',
            'Switzerland': 'CHE',
            'Channel Islands': 'CHI',
            'Chile': 'CHL',
            'China': 'CHN',
            'Cote d\'Ivoire': 'CIV',
            'Ivory Coast': 'CIV',
            'Cameroon': 'CMR',
            'Congo, Dem. Rep.': 'COD',
            'Democratic Republic of the Congo': 'COD',
            'Congo, Rep.': 'COG',
            'Republic of the Congo': 'COG',
            'Colombia': 'COL',
            'Comoros': 'COM',
            'Cabo Verde': 'CPV',
            'Cape Verde': 'CPV',
            'Costa Rica': 'CRI',
            'Cuba': 'CUB',
            'Curacao': 'CUW',
            'Cayman Islands': 'CYM',
            'Cyprus': 'CYP',
            'Czechia': 'CZE',
            'Czech Republic': 'CZE',
            'Germany': 'DEU',
            'Djibouti': 'DJI',
            'Dominica': 'DMA',
            'Denmark': 'DNK',
            'Dominican Republic': 'DOM',
            'Algeria': 'DZA',
            'Ecuador': 'ECU',
            'Egypt, Arab Rep.': 'EGY',
            'Egypt': 'EGY',
            'Eritrea': 'ERI',
            'Spain': 'ESP',
            'Estonia': 'EST',
            'Ethiopia': 'ETH',
            'Finland': 'FIN',
            'Fiji': 'FJI',
            'France': 'FRA',
            'Faroe Islands': 'FRO',
            'Micronesia, Fed. Sts.': 'FSM',
            'Micronesia': 'FSM',
            'Gabon': 'GAB',
            'United Kingdom': 'GBR',
            'Georgia': 'GEO',
            'Ghana': 'GHA',
            'Gibraltar': 'GIB',
            'Guinea': 'GIN',
            'Gambia, The': 'GMB',
            'Gambia': 'GMB',
            'Guinea-Bissau': 'GNB',
            'Equatorial Guinea': 'GNQ',
            'Greece': 'GRC',
            'Grenada': 'GRD',
            'Greenland': 'GRL',
            'Guatemala': 'GTM',
            'Guam': 'GUM',
            'Guyana': 'GUY',
            'Hong Kong SAR, China': 'HKG',
            'Honduras': 'HND',
            'Croatia': 'HRV',
            'Haiti': 'HTI',
            'Hungary': 'HUN',
            'Indonesia': 'IDN',
            'Isle of Man': 'IMN',
            'India': 'IND',
            'Ireland': 'IRL',
            'Iran, Islamic Rep.': 'IRN',
            'Iran': 'IRN',
            'Iraq': 'IRQ',
            'Iceland': 'ISL',
            'Israel': 'ISR',
            'Italy': 'ITA',
            'Jamaica': 'JAM',
            'Jordan': 'JOR',
            'Japan': 'JPN',
            'Kazakhstan': 'KAZ',
            'Kenya': 'KEN',
            'Kyrgyz Republic': 'KGZ',
            'Kyrgyzstan': 'KGZ',
            'Cambodia': 'KHM',
            'Kiribati': 'KIR',
            'St. Kitts and Nevis': 'KNA',
            'Korea, Rep.': 'KOR',
            'South Korea': 'KOR',
            'Korea': 'KOR',
            'Kuwait': 'KWT',
            'Lao PDR': 'LAO',
            'Laos': 'LAO',
            'Lebanon': 'LBN',
            'Liberia': 'LBR',
            'Libya': 'LBY',
            'St. Lucia': 'LCA',
            'Liechtenstein': 'LIE',
            'Sri Lanka': 'LKA',
            'Lithuania': 'LTU',
            'Luxembourg': 'LUX',
            'Latvia': 'LVA',
            'Macao SAR, China': 'MAC',
            'St. Martin (French part)': 'MAF',
            'Morocco': 'MAR',
            'Moldova': 'MDA',
            'Madagascar': 'MDG',
            'Maldives': 'MDV',
            'Mexico': 'MEX',
            'Marshall Islands': 'MHL',
            'North Macedonia': 'MKD',
            'Macedonia': 'MKD',
            'Mali': 'MLI',
            'Malta': 'MLT',
            'Myanmar': 'MMR',
            'Montenegro': 'MNE',
            'Mongolia': 'MNG',
            'Mozambique': 'MOZ',
            'Mauritania': 'MRT',
            'Mauritius': 'MUS',
            'Malawi': 'MWI',
            'Malaysia': 'MYS',
            'Namibia': 'NAM',
            'New Caledonia': 'NCL',
            'Niger': 'NER',
            'Nigeria': 'NGA',
            'Nicaragua': 'NIC',
            'Netherlands': 'NLD',
            'Norway': 'NOR',
            'Nepal': 'NPL',
            'Nauru': 'NRU',
            'New Zealand': 'NZL',
            'Oman': 'OMN',
            'Pakistan': 'PAK',
            'Panama': 'PAN',
            'Peru': 'PER',
            'Philippines': 'PHL',
            'Palau': 'PLW',
            'Papua New Guinea': 'PNG',
            'Poland': 'POL',
            'Puerto Rico': 'PRI',
            'Korea, Dem. People\'s Rep.': 'PRK',
            'North Korea': 'PRK',
            'Portugal': 'PRT',
            'Paraguay': 'PRY',
            'West Bank and Gaza': 'PSE',
            'Palestine': 'PSE',
            'West Bank': 'PSE',
            'French Polynesia': 'PYF',
            'Qatar': 'QAT',
            'Romania': 'ROU',
            'Russian Federation': 'RUS',
            'Russia': 'RUS',
            'Rwanda': 'RWA',
            'Saudi Arabia': 'SAU',
            'Sudan': 'SDN',
            'Senegal': 'SEN',
            'Singapore': 'SGP',
            'Solomon Islands': 'SLB',
            'Sierra Leone': 'SLE',
            'El Salvador': 'SLV',
            'Somalia': 'SOM',
            'Serbia': 'SRB',
            'South Sudan': 'SSD',
            'Sao Tome and Principe': 'STP',
            'Suriname': 'SUR',
            'Slovak Republic': 'SVK',
            'Slovakia': 'SVK',
            'Slovenia': 'SVN',
            'Sweden': 'SWE',
            'Eswatini': 'SWZ',
            'Swaziland': 'SWZ',
            'Sint Maarten (Dutch part)': 'SXM',
            'Seychelles': 'SYC',
            'Syrian Arab Republic': 'SYR',
            'Syria': 'SYR',
            'Turks and Caicos Islands': 'TCA',
            'Chad': 'TCD',
            'Togo': 'TGO',
            'Thailand': 'THA',
            'Tajikistan': 'TJK',
            'Turkmenistan': 'TKM',
            'Timor-Leste': 'TLS',
            'East Timor': 'TLS',
            'Tonga': 'TON',
            'Trinidad and Tobago': 'TTO',
            'Tunisia': 'TUN',
            'Turkiye': 'TUR',
            'Turkey': 'TUR',
            'Tuvalu': 'TUV',
            'Tanzania': 'TZA',
            'Uganda': 'UGA',
            'Ukraine': 'UKR',
            'Uruguay': 'URY',
            'United States': 'USA',
            'Uzbekistan': 'UZB',
            'St. Vincent and the Grenadines': 'VCT',
            'Venezuela, RB': 'VEN',
            'Venezuela': 'VEN',
            'British Virgin Islands': 'VGB',
            'Virgin Islands (U.S.)': 'VIR',
            'Viet Nam': 'VNM',
            'Vietnam': 'VNM',
            'Vanuatu': 'VUT',
            'Samoa': 'WSM',
            'Kosovo': 'XKX',
            'Yemen, Rep.': 'YEM',
            'Yemen': 'YEM',
            'South Africa': 'ZAF',
            'Zambia': 'ZMB',
            'Zimbabwe': 'ZWE'
        };

        // Fetch topology data
        const topology = await fetch(
            'https://code.highcharts.com/mapdata/custom/world.topo.json'
        ).then(response => response.json());

        // Fetch protests data from API
        const protestsResponse = await fetch('/api/v2/protests');
        const protestsData = await protestsResponse.json();

        // Group protests by country
        const protestsByCountry = {};
        
        let data = protestsData;
        if (protestsData.data && Array.isArray(protestsData.data)) {
            data = protestsData.data;
        }

        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.country) {
                    // @ts-ignore
                    if (!protestsByCountry[item.country]) {
                        // @ts-ignore
                        protestsByCountry[item.country] = 0;
                    }
                    // @ts-ignore
                    protestsByCountry[item.country]++;
                }
            });
        }

        // Convert to CSV format with ISO-3 codes
        let csvData = 'Country Code;Protests\n';
        
        for (const [country, count] of Object.entries(protestsByCountry)) {
            // @ts-ignore
            const isoCode = countryToISO[country];
            if (isoCode) {
                csvData += `${isoCode};${count}\n`;
            }
        }

        // @ts-ignore
        Highcharts.mapChart('container', {
            chart: {
                map: topology
            },

            title: {
                text: 'Protestas por país',
                align: 'left'
            },

            credits: {
                text: 'Data source: API',
                href: '#'
            },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            colorAxis: {
                min: 0
            },

            data: {
                csv: csvData,
                seriesMapping: [{
                    code: 0,
                    value: 1
                }]
            },

            tooltip: {
                valueDecimals: 0,
                valueSuffix: ' protestas'
            },

            series: [{
                name: 'Protestas',
                joinBy: ['iso-a3', 'code'],
                dataLabels: {
                    enabled: true,
                    format: '{point.value}',
                    filter: {
                        operator: '>',
                        property: 'labelrank',
                        value: 250
                    },
                    style: {
                        fontWeight: 'normal'
                    }
                }
            }]
        });
    } catch (error) {
        console.error('Error loading data:', error);
    }
})();
</script>

<style>
    body {
    background: var(--highcharts-background-color);
    color: var(--highcharts-neutral-color-100);
}

#container {
    height: 500px;
    min-width: 310px;
    max-width: 800px;
    margin: 0 auto;
}

#csv {
    display: none;
}
</style>