import { t } from "../i18n/index.js";
import { isRecovery, isVaccination } from "./status.js";

/**
 * @param {import("../types").EuropeanProof[]} proofs
 * @param {import("../types").Locale} locale
 * @return {string[]}
 */
export function formatEuProofEvents(proofs, locale) {
    return proofs.map(function (proof) {
        if (isVaccination(proof)) {
            return (
                t(
                    locale,
                    "cover.vaccination." +
                        (proof.doseNumber > 9 ? "extra" : proof.doseNumber)
                ) +
                " (" +
                proof.doseNumber +
                "/" +
                proof.totalDoses +
                ")"
            );
        }
        if (isRecovery(proof)) {
            return t(locale, "cover.recoveryProof");
        }
        return t(locale, "cover.otherProof");
    });
}
