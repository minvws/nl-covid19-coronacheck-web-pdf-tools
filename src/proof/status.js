var MONTH_MS = 28 * 24 * 60 * 60 * 1000;

/**
 * @param {import("../types").Proof[]} proofs
 * @return {import("../types").EuropeanProof[]}
 */
export function getEuropeanProofs(proofs) {
    // @ts-ignore
    return proofs.filter(isEuropeanProof).sort(byDoseNumber);
}

/**
 * @param {import("../types").Proof[]} proofs
 * @param {Date|number} createdAt
 * @return {import("../types").VaccinationStatus}
 */
export function getVaccinationStatus(proofs, createdAt) {
    var vaccinations = proofs.filter(isVaccination).sort(byDoseNumber);

    if (vaccinations.length === 0) {
        return "unvaccinated";
    }

    var best = vaccinations[vaccinations.length - 1];

    if (best.doseNumber >= 3) {
        return "triple-dose";
    }

    if (best.doseNumber === 2) {
        if (createdAt instanceof Date) createdAt = createdAt.getTime();
        var vaccinationDate = new Date(best.credential.dt).getTime();
        var recent = createdAt - vaccinationDate < MONTH_MS;
        return recent ? "recent-double-dose" : "double-dose";
    }

    if (best.doseNumber === 1) {
        var recovery = proofs.filter(isRecovery)[0];
        return recovery ? "single-dose-and-recovery" : "single-dose";
    }

    return "unknown";
}

/**
 * @param {import("../types").Proof} a
 * @param {import("../types").Proof} b
 * @return {number}
 */
function byDoseNumber(a, b) {
    var doseA = isVaccination(a) ? a.doseNumber : 0;
    var doseB = isVaccination(b) ? b.doseNumber : 0;
    return doseA - doseB;
}

/**
 * @param {import("../types").Proof} proof
 * @return {proof is import("../types").EuropeanProof}
 */
function isEuropeanProof(proof) {
    return proof.territory === "eu";
}

/**
 * @param {import("../types").Proof} proof
 * @return {proof is import("../types").EuropeanVaccinationProof}
 */
export function isVaccination(proof) {
    return proof.territory === "eu" && proof.eventType === "vaccination";
}

/**
 * @param {import("../types").Proof} proof
 * @return {proof is import("../types").EuropeanRecoveryProof}
 */
export function isRecovery(proof) {
    return proof.territory === "eu" && proof.eventType === "recovery";
}
