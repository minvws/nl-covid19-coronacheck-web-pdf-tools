export const getEuBrand = (holderConfig, euBrandCode) =>
    findNameByCode(holderConfig.euBrands, euBrandCode);

export const getEuTestType = (holderConfig, testTypeCode) =>
    findNameByCode(holderConfig.euTestTypes, testTypeCode);

export const getTestManufacturer = (holderConfig, testManufacturerCode) =>
    findNameByCode(holderConfig.euTestManufacturers, testManufacturerCode);

export const getVaccineType = (holderConfig, vaccineTypeCode) =>
    findNameByCode(holderConfig.euVaccinations, vaccineTypeCode);

export const getVaccineManufacturer = (holderConfig, vaccineManufacturerCode) =>
    findNameByCode(holderConfig.euManufacturers, vaccineManufacturerCode);

export const getNlTestType = (holderConfig, testTypeCode) =>
    findNameByCode(holderConfig.euTestTypes, testTypeCode);

const findNameByCode = (arr, code) => {
    const found = arr.find((item) => item.code === code);
    return found && found.name;
};
