/**
 * @param {import("./types").HolderConfig} holderConfig
 * @param {string} euBrandCode
 * @return {string}
 */
export function getEuBrand(holderConfig, euBrandCode) {
    return findNameByCode(holderConfig.euBrands, euBrandCode);
}

/**
 * @param {import("./types").HolderConfig} holderConfig
 * @param {string} testTypeCode
 * @return {string}
 */
export function getEuTestType(holderConfig, testTypeCode) {
    return findNameByCode(holderConfig.euTestTypes, testTypeCode);
}

/**
 * @param {import("./types").HolderConfig} holderConfig
 * @param {string} testManufacturerCode
 * @return {string}
 */
export function getTestManufacturer(holderConfig, testManufacturerCode) {
    return findNameByCode(
        holderConfig.euTestManufacturers,
        testManufacturerCode
    );
}

/**
 * @param {import("./types").HolderConfig} holderConfig
 * @param {string} vaccineTypeCode
 * @return {string}
 */
export function getVaccineType(holderConfig, vaccineTypeCode) {
    return findNameByCode(holderConfig.euVaccinations, vaccineTypeCode);
}

/**
 * @param {import("./types").HolderConfig} holderConfig
 * @param {string} vaccineManufacturerCode
 * @return {string}
 */
export function getVaccineManufacturer(holderConfig, vaccineManufacturerCode) {
    return findNameByCode(
        holderConfig.euManufacturers,
        vaccineManufacturerCode
    );
}

/**
 * @param {import("./types").HolderConfig} holderConfig
 * @param {string} testTypeCode
 * @return {string}
 */
export function getNlTestType(holderConfig, testTypeCode) {
    return findNameByCode(holderConfig.euTestTypes, testTypeCode);
}

/**
 * @param {{ name: string, code: string }[]} arr
 * @param {string} code
 * @return {string|undefined}
 */
export function findNameByCode(arr, code) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].code === code) return arr[i].name;
    }
}

/**
 * @param {import("./types").HolderConfig} holderConfig
 * @return {import("./types").DisclosurePolicy}
 */
export function getDisclosurePolicy(holderConfig) {
    return Array.isArray(holderConfig.disclosurePolicy) &&
        holderConfig.disclosurePolicy.length === 1 &&
        holderConfig.disclosurePolicy[0].toUpperCase() === "1G"
        ? "1G"
        : "3G";
}

/**
 * @param {import("./types").HolderConfig} holderConfig
 * @param {string} code
 * @return {string}
 */
export function getEuTestName(holderConfig, code) {
    return findNameByCode(holderConfig.euTestNames, code);
}
