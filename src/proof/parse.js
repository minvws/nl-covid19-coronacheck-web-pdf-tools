import {
    formatBirthDate,
    formatDate,
    formatLocalDateTime,
    hoursInMs,
} from "../date.js";
import {
    getEuBrand,
    getEuTestType,
    getTestManufacturer,
    getVaccineManufacturer,
    getVaccineType,
    getDisclosurePolicy,
    getEuTestName,
} from "../holder.js";

var RAT = "LP217198-3";

/**
 * @param {import("../types").ProofData} proofData
 * @param {import("../types").HolderConfig} holderConfig
 * @param {import("../types").Locale} [locale]
 * @return {import("../types").Proof[]}
 */
export function parseProofData(proofData, holderConfig, locale) {
    /** @type {import("../types").Proof[]} */
    var proofs = [];

    if (proofData.domestic) {
        proofs.push(
            parseDomesticProof(proofData.domestic, holderConfig, locale)
        );
    }
    if (proofData.european) {
        proofs = proofs.concat(
            parseEuropeanProofs(proofData.european, holderConfig)
        );
    }

    return proofs;
}

/**
 * @param {import("../types").DomesticProofData} data
 * @param {import("../types").HolderConfig} holderConfig
 * @param {import("../types").Locale} [locale]
 * @return {import("../types").Proof}
 */
export function parseDomesticProof(data, holderConfig, locale) {
    var validFromDate = parseInt(data.attributes.validFrom, 10) * 1000;
    return {
        proofType: "domestic",

        territory: "nl",

        qr: data.qr,

        initials:
            (data.attributes.firstNameInitial
                ? data.attributes.firstNameInitial + ". "
                : "") +
            (data.attributes.lastNameInitial
                ? data.attributes.lastNameInitial + "."
                : ""),

        birthDateStringShort: formatBirthDate(
            data.attributes.birthDay,
            data.attributes.birthMonth,
            locale || "nl"
        ),

        validFromDate,

        validFrom: formatLocalDateTime(validFromDate),

        validUntil: formatLocalDateTime(
            validFromDate + hoursInMs(data.attributes.validForHours)
        ),

        keyIdentifier: data.keyIdentifier || null,

        validAtMost15Days: parseInt(data.attributes.validForHours, 10) <= 360,

        disclosurePolicy: getDisclosurePolicy(holderConfig),
    };
}

/**
 * @param {import("../types").EuropeanProofData|import("../types").EuropeanProofData[]} data
 * @param {import("../types").HolderConfig} holderConfig
 * @return {import("../types").Proof[]}
 */
export function parseEuropeanProofs(data, holderConfig) {
    /** @type {import("../types").Proof[]} */
    var proofs = [];
    var i;

    if (Array.isArray(data)) {
        for (i = 0; i < data.length; i++) {
            proofs = proofs.concat(parseEuropeanProofs(data[i], holderConfig));
        }
        return proofs;
    }

    if (data.dcc.v) {
        for (i = 0; i < data.dcc.v.length; i++) {
            var vaccination = data.dcc.v[i];
            proofs.push({
                proofType: "european-vaccination",

                eventType: "vaccination",

                territory: "eu",

                qr: data.qr,

                credential: vaccination,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: formatDate(data.dcc.dob),

                certificateNumber: vaccination.ci,

                validUntil: formatDate(data.expirationTime),

                vaccineBrand: getEuBrand(holderConfig, vaccination.mp) || "-",

                vaccineManufacturer:
                    getVaccineManufacturer(holderConfig, vaccination.ma) || "-",

                vaccineType:
                    getVaccineType(holderConfig, vaccination.vp) || "-",

                doseNumber: vaccination.dn,

                totalDoses: vaccination.sd,

                doses: vaccination.dn + " / " + vaccination.sd,

                vaccinationDate: formatDate(vaccination.dt),

                vaccinationCountry: vaccination.co,

                certificateIssuer: vaccination.is,

                certificateIdentifier: vaccination.ci,

                // TODO
                validFrom: "TODO",
            });
        }
    }
    if (data.dcc.t) {
        for (i = 0; i < data.dcc.t.length; i++) {
            var test = data.dcc.t[i];
            proofs.push({
                proofType: "european-negative-test",

                eventType: "negativetest",

                territory: "eu",

                qr: data.qr,

                credential: test,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: formatDate(data.dcc.dob),

                certificateNumber: test.ci,

                validUntil: formatLocalDateTime(data.expirationTime),

                testType: getEuTestType(holderConfig, test.tt) || "",

                testName: parseEuropeanTestName(test, holderConfig),

                dateOfTest: formatLocalDateTime(test.sc),

                testLocation: test.tc,

                testManufacturer:
                    getTestManufacturer(holderConfig, test.ma) || "",

                countryOfTest: test.co,

                certificateIssuer: test.is,

                // TODO
                validFrom: "TODO",
            });
        }
    }
    if (data.dcc.r) {
        for (i = 0; i < data.dcc.r.length; i++) {
            var recovery = data.dcc.r[i];
            proofs.push({
                proofType: "european-recovery",

                eventType: "recovery",

                territory: "eu",

                qr: data.qr,

                credential: recovery,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: formatDate(data.dcc.dob),

                dateOfTest: formatDate(recovery.fr),

                countryOfTest: recovery.co,

                certificateIssuer: recovery.is,

                certificateNumber: recovery.ci,

                validUntil: formatDate(recovery.du),

                validFrom: formatDate(recovery.df),
            });
        }
    }
    return proofs;
}

/**
 * @param {string} testType
 * @return {boolean}
 */
export function isRAT(testType) {
    return testType === RAT;
}

/**
 * @param {import("../types").EuTestCredential} test
 * @param {import("../types").HolderConfig} holderConfig
 * @return {string}
 */
export function parseEuropeanTestName(test, holderConfig) {
    if (isRAT(test.tt) && test.ma) {
        return getEuTestName(holderConfig, test.ma) || test.nm;
    }
    return test.nm;
}
