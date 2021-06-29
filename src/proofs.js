import { formatBirthDate, formatDateTime, hoursInMs } from "./date";
import { getEuBrand, getVaccineManufacturer, getVaccineType } from "./holder";

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
        for (const v of data.dcc.v) {
            proofs.push({
                proofType: "european-vaccination",

                eventType: "vaccination",

                territory: "eu",

                qr: data.qr,

                credential: v,

                fullName: data.dcc.nam.fn + ", " + data.dcc.nam.gn,

                birthDateString: data.dcc.dob,

                certificateNumber: v.ci,

                validUntil: formatDateTime(new Date(data.expirationTime)),

                vaccineBrand: getEuBrand(holderConfig, v.mp) || "-",

                vaccineManufacturer:
                    getVaccineManufacturer(holderConfig, v.ma) || "-",

                vaccineType: getVaccineType(holderConfig, v.vp) || "-",

                doseNumber: v.dn,

                totalDoses: v.sd,

                vaccinationDate: v.dt,

                vaccinationCountry: v.co,

                certificateIssuer: v.is,

                certificateIdentifier: v.ci,

                // TODO
                validFrom: "TODO",
            });
        }
    }
    // TODO: dcc.t, dcc.r
    return proofs;
};
