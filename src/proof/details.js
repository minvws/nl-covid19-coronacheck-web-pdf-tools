import { regionNames } from "../i18n/index.js";
/**
 * @param {import("../types").EuropeanProof} proof
 * @param {import("../pdf/document.js").Document} doc
 * @return {string[][]}
 */
export function getProofDetails(proof, doc) {
    if (proof.eventType === "vaccination") {
        return [
            ["name", proof.fullName],
            ["dateOfBirth", proof.birthDateString],
            ["disease", "COVID-19"],
            ["vaccineBrand", proof.vaccineBrand],
            ["vaccineType", proof.vaccineType],
            ["vaccineManufacturer", proof.vaccineManufacturer],
            ["doses", proof.doses],
            ["vaccinationDate", proof.vaccinationDate],
            [
                "vaccinationCountry",
                countryNameTranslation(proof.vaccinationCountry, doc.locale),
            ],
            ["certificateIssuer", normalizeIssuer(proof.certificateIssuer)],
        ];
    }
    if (proof.eventType === "negativetest") {
        return [
            ["name", proof.fullName],
            ["dateOfBirth", proof.birthDateString],
            ["disease", "COVID-19"],
            ["testType", proof.testType],
            ["testName", proof.testName],
            ["testDate", proof.dateOfTest],
            ["testResult", "Negative (no coronavirus detected)"],
            ["testLocation", proof.testLocation],
            ["testManufacturer", proof.testManufacturer],
            [
                "countryOfTest",
                countryNameTranslation(proof.countryOfTest, doc.locale),
            ],
            ["certificateIssuer", normalizeIssuer(proof.certificateIssuer)],
        ];
    }
    if (proof.eventType === "recovery") {
        return [
            ["name", proof.fullName],
            ["dateOfBirth", proof.birthDateString],
            ["diseaseRecoveredFrom", "COVID-19"],
            ["testDate", proof.dateOfTest],
            [
                "countryOfTest",
                countryNameTranslation(proof.countryOfTest, doc.locale),
            ],
            ["certificateIssuer", normalizeIssuer(proof.certificateIssuer)],
            ["validFrom", proof.validFrom],
            ["validUntil", proof.validUntil],
        ];
    }
    throwOnUnhandledEventType(proof);
}

/**
 *
 * @param ISO3166
 * @param locale
 * @returns {*}
 */
function countryNameTranslation(ISO3166, locale = "en") {
    // Force English country translations as per specification
    locale = "en";

    let countryName = regionNames[locale].of(ISO3166);
    if (ISO3166.toLowerCase() === "nl") {
        // Because js intl does not provide article country names, we have to manually add this
        countryName = "The " + countryName;
    }

    return countryName;
}

/**
 * @param {string} issuer
 * @returns {string}
 */
function normalizeIssuer(issuer) {
    return issuer === "Ministry of Health Welfare and Sport"
        ? "Ministry of Health,\nWelfare and Sport"
        : issuer;
}

/**
 * @param {never} proof
 */
function throwOnUnhandledEventType(proof) {
    throw new Error(
        'Unable to format proof details (territory "' +
            // @ts-ignore proof has type `never`
            proof.territory +
            '", eventType "' +
            // @ts-ignore proof has type `never`
            proof.eventType +
            '")'
    );
}
