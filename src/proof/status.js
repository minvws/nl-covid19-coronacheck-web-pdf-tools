var MONTH_MS = 28 * 24 * 60 * 60 * 1000;

/**
 * @param {import("../types").Proof[]} proofs
 * @return {import("../types").EuropeanVaccinationProof[]}
 */
export function getSortedVaccinations(proofs) {
    return proofs.filter(isVaccination).sort(byDoseNumber);
}

/**
 * @param {import("../types").Proof[]} proofs
 * @param {Date|number} createdAt
 * @return {'unvaccinated'|'single-dose'|'recent-double-dose'|'double-dose'|'triple-dose'|'unknown'}
 */
export function getVaccinationStatus(proofs, createdAt) {
    var vaccinations = getSortedVaccinations(proofs);

    if (vaccinations.length === 0) {
        return "unvaccinated";
    }

    var best = vaccinations[vaccinations.length - 1];

    if (best.totalDoses >= 3) {
        return "triple-dose";
    }

    if (best.totalDoses === 2) {
        if (createdAt instanceof Date) createdAt = createdAt.getTime();
        var vaccinationDate = new Date(best.credential.dt).getTime();
        var recent = createdAt - vaccinationDate < MONTH_MS;
        return recent ? "recent-double-dose" : "double-dose";
    }

    if (best.totalDoses === 1) {
        return "single-dose";
    }

    return "unknown";
}

/**
 * @param {import("../types").Proof} proof
 * @return {boolean}
 */
function isVaccination(proof) {
    return proof.eventType === "vaccination";
}

/**
 * @param {import("../types").EuropeanVaccinationProof} a
 * @param {import("../types").EuropeanVaccinationProof} b
 * @return {number}
 */
function byDoseNumber(a, b) {
    a.doseNumber - b.doseNumber;
}
