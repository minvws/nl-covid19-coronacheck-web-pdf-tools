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
} from "../holder.js";

/**
 * @param {import("../types").ProofData} proofData
 * @param {import("../types").TODO} holderConfig
 * @param {import("../types").Locale} [locale]
 * @return {import("../types").Proof[]}
 */
export function parseProofData(proofData, holderConfig, locale) {
    /** @type {import("../types").Proof[]} */
    var proofs = [];

    if (proofData.domestic) {
        proofs.push(domesticProof(proofData.domestic, locale));
    }
    if (proofData.european) {
        var european = Array.isArray(proofData.european)
            ? proofData.european
            : [proofData.european];
        for (var item of european) {
            for (var proof of europeanProofs(item, holderConfig)) {
                proofs.push(proof);
            }
        }
    }

    return proofs;
}

/**
 * @param {import("../types").DomesticProofData} data
 * @param {import("../types").Locale} [locale]
 * @return {import("../types").Proof}
 */
function domesticProof(data, locale) {
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
    };
}

/**
 * @param {import("../types").EuropeanProofData} data
 * @param {any} holderConfig
 * @return {import("../types").Proof[]}
 */
function europeanProofs(data, holderConfig) {
    /** @type {import("../types").Proof[]} */
    var proofs = [];
    var credential;
    if (data.dcc.v) {
        for (credential of data.dcc.v) {
            proofs.push({
                proofType: "european-vaccination",

                eventType: "vaccination",

                territory: "eu",

                qr: data.qr,

                credential: credential,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: formatDate(data.dcc.dob),

                certificateNumber: credential.ci,

                validUntil: formatDate(data.expirationTime),

                vaccineBrand: getEuBrand(holderConfig, credential.mp) || "-",

                vaccineManufacturer:
                    getVaccineManufacturer(holderConfig, credential.ma) || "-",

                vaccineType: getVaccineType(holderConfig, credential.vp) || "-",

                doseNumber: credential.dn,

                totalDoses: credential.sd,

                doses: credential.dn + " / " + credential.sd,

                vaccinationDate: formatDate(credential.dt),

                vaccinationCountry: credential.co,

                certificateIssuer: credential.is,

                certificateIdentifier: credential.ci,

                // TODO
                validFrom: "TODO",
            });
        }
    }
    if (data.dcc.t) {
        for (credential of data.dcc.t) {
            proofs.push({
                proofType: "european-negative-test",

                eventType: "negativetest",

                territory: "eu",

                qr: data.qr,

                credential: credential,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: formatDate(data.dcc.dob),

                certificateNumber: credential.ci,

                validUntil: formatLocalDateTime(data.expirationTime),

                testType: getEuTestType(holderConfig, credential.tt) || "",

                testName: credential.nm,

                dateOfTest: formatLocalDateTime(credential.sc),

                testLocation: credential.tc,

                testManufacturer:
                    getTestManufacturer(holderConfig, credential.ma) || "",

                countryOfTest: credential.co,

                certificateIssuer: credential.is,

                // TODO
                validFrom: "TODO",
            });
        }
    }
    if (data.dcc.r) {
        for (credential of data.dcc.r) {
            proofs.push({
                proofType: "european-recovery",

                eventType: "recovery",

                territory: "eu",

                qr: data.qr,

                credential: credential,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: formatDate(data.dcc.dob),

                dateOfTest: formatDate(credential.fr),

                countryOfTest: credential.co,

                certificateIssuer: credential.is,

                certificateNumber: credential.ci,

                validUntil: formatDate(credential.du),

                validFrom: formatDate(credential.df),
            });
        }
    }
    return proofs;
}
