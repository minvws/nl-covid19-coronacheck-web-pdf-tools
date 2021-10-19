/**
 * @typedef {Object} Address
 * @property {string} firstNames
 * @property {string} [prefixSurname]
 * @property {string} surname
 * @property {string} location
 * @property {""|"M"|"V"|"O"} gender
 * @property {""|"B"|"G"|"GI"|"H"|"HI"|"JH"|"JV"|"M"|"MI"|"P"|"PS"|"R"} [honorary_title]
 * @property {string} postal_code
 * @property {string} [infix_partner]
 * @property {"E"|"P"|"V"|"N"} designation_name
 * @property {string} [surname_partner]
 * @property {string} street_name
 * @property {string} [house_number]
 * @property {string} [house_letter]
 * @property {string} [house_number_additional]
 * @property {"by"|"to"} [info_house_number]
 */

/**
 * @param {Address} address
 * @return {string}
 */
export function formatSalutation(address) {
    var lastName = formatLastName(address);
    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    if (address.gender === "M") return "Geachte heer " + lastName;
    if (address.gender === "V") return "Geachte mevrouw " + lastName;
    if (address.gender === "O") return "Geachte heer/mevrouw " + lastName;
    return lastName;
}

/**
 * @param {Address} address
 * @return {string}
 */
export function formatAddressSalutation(address) {
    var initials = formatInitials(address.firstNames);
    var lastName = formatLastName(address);
    if (address.gender === "M") return "De heer " + initials + " " + lastName;
    if (address.gender === "V") return "Mevrouw " + initials + " " + lastName;
    if (address.gender === "O")
        return "De heer/mevrouw " + initials + " " + lastName;
    return initials + " " + lastName;
}

/**
 * @param {Address} address
 * @return {string}
 */
export function formatLastName(address) {
    if (address.designation_name === "P" && address.surname_partner)
        return partnerSurname(address);
    if (address.designation_name === "V" && address.surname_partner)
        return partnerSurname(address) + " - " + ownSurname(address);
    if (address.designation_name === "N" && address.surname_partner)
        return ownSurname(address) + " - " + partnerSurname(address);
    return ownSurname(address);
}

function ownSurname(address) {
    return (
        (address.prefixSurname ? address.prefixSurname + " " : "") +
        address.surname
    );
}

function partnerSurname(address) {
    return (
        (address.infix_partner ? address.infix_partner + " " : "") +
        address.surname_partner
    );
}

/**
 * @param {Address} address
 * @return {string[]}
 */
export function formatAddress(address) {
    return [
        formatAddressSalutation(address),
        address.street_name + " " + formatHouseNumber(address),
        formatPostalCode(address.postal_code) +
            (address.location ? "  " + address.location.toUpperCase() : ""),
    ];
}

export function formatPostalCode(postalCode) {
    return /^\d{4}\w{2}$/.test(postalCode)
        ? postalCode.slice(0, 4) + " " + postalCode.slice(4, 6)
        : postalCode;
}

export function formatHouseNumber(address) {
    return (
        (address.info_house_number ? address.info_house_number + " " : "") +
        (address.house_number || "") +
        (address.house_letter || "") +
        (address.house_number_additional
            ? " " + address.house_number_additional
            : "")
    );
}

/**
 * @param {Address} address
 * @return {string}
 */
export function formatKixCode(address) {
    return (
        address.postal_code.replace(/\s/g, "") +
        address.house_number +
        (address.house_letter ? "X" + address.house_letter : "") +
        (address.house_number_additional
            ? "X" + address.house_number_additional
            : "")
    );
}

/**
 * @param {string} firstNames
 * @return {string}
 */
export function formatInitials(firstNames) {
    var matcher = /(?:^|\s+)(ij|.)/gi;
    var result = "";
    for (var match; (match = matcher.exec(firstNames)); ) {
        result += match[1].toUpperCase() + ".";
    }
    return result;
}
