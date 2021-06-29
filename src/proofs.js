import { formatBirthDate, formatDateTime, hoursInMs } from "./date";
import {
    getEuBrand,
    getEuTestType,
    getTestManufacturer,
    getVaccineManufacturer,
    getVaccineType,
} from "./holder";

/**
 * TODO any type
 * @param {import("./types").ProofData} proofData
 * @param {any} holderConfig
 * @return {import("./types").Proof[]}
 */
export const parseProofData = (proofData, holderConfig) => {
    /** @type {import("./types").Proof[]} */
    const proofs = [];

    if (proofData.domestic) {
        proofs.push(domesticProof(proofData.domestic));
    }
    if (proofData.european) {
        for (const proof of europeanProofs(proofData.european, holderConfig)) {
            proofs.push(proof);
        }
    }

    return proofs;
};

/**
 * @param {import("./types").DomesticProofData} data
 * @return {import("./types").Proof}
 */
const domesticProof = (data) => {
    const validFromDate = parseInt(data.attributes.validFrom, 10) * 1000;
    return {
        proofType: "domestic-vaccination",

        eventType: "vaccination",

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
            data.attributes.birthMonth
        ),

        validFromDate,

        validFrom: formatDateTime(validFromDate),

        validUntil: formatDateTime(
            validFromDate + hoursInMs(data.attributes.validForHours)
        ),
    };
};

/**
 * @param {import("./types").EuropeanProofData} data
 * @param {any} holderConfig
 * @return {import("./types").Proof[]}
 */
const europeanProofs = (data, holderConfig) => {
    /** @type {import("./types").Proof[]} */
    const proofs = [];
    if (data.dcc.v) {
        for (const credential of data.dcc.v) {
            proofs.push({
                proofType: "european-vaccination",

                eventType: "vaccination",

                territory: "eu",

                qr: data.qr,

                credential: credential,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: data.dcc.dob,

                certificateNumber: credential.ci,

                validUntil: formatDateTime(new Date(data.expirationTime)),

                vaccineBrand: getEuBrand(holderConfig, credential.mp) || "-",

                vaccineManufacturer:
                    getVaccineManufacturer(holderConfig, credential.ma) || "-",

                vaccineType: getVaccineType(holderConfig, credential.vp) || "-",

                doseNumber: credential.dn,

                totalDoses: credential.sd,

                vaccinationDate: credential.dt,

                vaccinationCountry: credential.co,

                certificateIssuer: credential.is,

                certificateIdentifier: credential.ci,

                // TODO
                validFrom: "TODO",
            });
        }
    }
    if (data.dcc.t) {
        for (const credential of data.dcc.t) {
            proofs.push({
                proofType: "european-vaccination",

                eventType: "vaccination",

                territory: "eu",

                qr: data.qr,

                credential: credential,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: data.dcc.dob,

                certificateNumber: credential.ci,

                validUntil: formatDateTime(new Date(data.expirationTime)),

                testType: getEuTestType(holderConfig, credential.tt) || "",

                testName: credential.nm,

                dateOfTest: formatDateTime(new Date(credential.sc)),

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
        for (const credential of data.dcc.r) {
            proofs.push({
                proofType: "european-vaccination",

                eventType: "vaccination",

                territory: "eu",

                qr: data.qr,

                credential: credential,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: data.dcc.dob,

                certificateNumber: credential.ci,

                validUntil: formatDateTime(new Date(data.expirationTime)),

                validFrom: credential.df,

                // TODO: r.fr, r.du
            });
        }
    }
    return proofs;
};
