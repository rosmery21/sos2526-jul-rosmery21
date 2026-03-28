export function validateTypes(entity, year){
    return !(typeof entity !== 'string' || isNaN(parseInt(year)));
}

export function validateYear(year){
    return (year > 1900 && year <= new Date().getFullYear());
}

export function validateRiskFactors(data) {
    const factors = [
        'high_systolic_blood_pressure', 'air_pollution', 'child_wasting',
        'household_air_pollution_from_solid_fuels', 'high_fasting_plasma_glucose'
    ];
    return factors.every(field => data[field] >= 0);
}
