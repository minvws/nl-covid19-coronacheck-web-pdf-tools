import { t } from "../i18n/index.js";
import {
    MontserratBold,
    RobotoRegular,
    RobotoBold,
    ROSansWebTextRegular,
    ROSansWebTextBold,
} from "../assets/fonts.js";
import { formatLocalDate } from "../date.js";
import {
    drawLogoCoronaCheck,
    drawLogoRijksoverheidA4,
    drawText,
} from "./draw.js";
import {
    getEuropeanProofs,
    getVaccinationStatus,
    isRecovery,
    isVaccination,
} from "../proof/status.js";

var pageHeight = 297;
var pageWidth = 210;
var marginX = 16;
var marginY = 14;
var textWidth = pageWidth - 2 * marginX;
var fontSizeH1 = 22;
var fontSizeStandard = 12;
var textStart = 52; // 13mm below logo, as prescribed by rijkshuisstijl.nl

var dpmm = 72 / 25.4; // dots per mm at 72dpi

var titleColor = "#383836";

export function addDccCoverPage(doc, proofs, createdAt) {
    proofs = getEuropeanProofs(proofs);
    var vaccinationStatus = getVaccinationStatus(proofs, createdAt);
    if (
        proofs.length < 2 ||
        vaccinationStatus === "unvaccinated" ||
        vaccinationStatus === "single-dose"
    ) {
        return false;
    }

    doc.loadFont("MontserratBold", MontserratBold);
    doc.loadFont("RobotoRegular", RobotoRegular);
    doc.loadFont("RobotoBold", RobotoBold);
    doc.loadFont("ROSansRegular", ROSansWebTextRegular);
    doc.loadFont("ROSansBold", ROSansWebTextBold);
    doc._pdf.addPage({ margin: 0, size: "A4" });

    doc._pdf.addStructure(
        doc._pdf.struct(
            "Figure",
            { alt: t(doc.locale, "alt.logoRijksoverheid") },
            function () {
                drawLogoRijksoverheidA4(doc, pageWidth / 2, 0);
            }
        )
    );

    doc._pdf.addStructure(
        doc._pdf.struct("Sect", [
            doc._pdf.struct("H", function () {
                drawText(doc, {
                    text: t(doc.locale, "cover.title"),
                    font: "MontserratBold",
                    size: fontSizeH1,
                    color: titleColor,
                    position: [marginX, textStart],
                    width: textWidth,
                    lineGap: 2,
                });
            }),
            doc._pdf.struct("P", function () {
                drawText(doc, {
                    text: "\n" + t(doc.locale, "cover.intro"),
                    font: "ROSansRegular",
                    size: fontSizeStandard,
                    width: textWidth,
                    lineGap: 2,
                });
            }),
            doc._pdf.struct("Sect", [
                doc._pdf.struct("H", function () {
                    drawText(doc, {
                        text: "\n" + t(doc.locale, "cover.yourProofs.title"),
                        font: "ROSansBold",
                        size: fontSizeStandard,
                        position: [marginX, null],
                        width: textWidth,
                        lineGap: 2,
                    });
                }),
                proofsList(doc, proofs),
            ]),
            doc._pdf.struct("Sect", [
                doc._pdf.struct("H", function () {
                    drawText(doc, {
                        text: "\n" + t(doc.locale, "cover.whichCode.title"),
                        font: "ROSansBold",
                        size: fontSizeStandard,
                        position: [marginX, null],
                        width: textWidth,
                        lineGap: 2,
                    });
                }),
                doc._pdf.struct("P", function () {
                    var vaccinationStatus = getVaccinationStatus(
                        proofs,
                        createdAt
                    );
                    var text = t(
                        doc.locale,
                        "cover.whichCode." + vaccinationStatus
                    );
                    if (!text)
                        throw new Error(
                            "Unhandled vaccination status " + vaccinationStatus
                        );

                    drawText(doc, {
                        text: text,
                        font: "ROSansRegular",
                        size: fontSizeStandard,
                        position: [marginX, null],
                        width: textWidth,
                        lineGap: 2,
                    });
                }),
            ]),
            doc._pdf.struct("Sect", [
                doc._pdf.struct("P", function () {
                    drawText(doc, {
                        text: "\n" + t(doc.locale, "cover.beforeTravel"),
                        font: "ROSansBold",
                        size: fontSizeStandard,
                        position: [marginX, null],
                        width: textWidth,
                        lineGap: 2,
                    });
                }),
            ]),
        ])
    );

    doc._pdf.addStructure(
        doc._pdf.struct(
            "Figure",
            { alt: t(doc.locale, "alt.logoCoronacheck") },
            function () {
                var x = marginX;
                var y = pageHeight - marginY - 9;
                drawLogoCoronaCheck(doc, x, y, 9);
                drawText(doc, {
                    text: "CoronaCheck",
                    font: "MontserratBold",
                    size: 14,
                    color: titleColor,
                    position: [x + 12, y + 4.5],
                    baseline: "middle",
                });
            }
        )
    );

    drawText(doc, {
        text: t(doc.locale, "cover.issuedOn", {
            date: formatLocalDate(createdAt),
        }),
        font: "ROSansRegular",
        size: fontSizeStandard,
        width: 50,
        align: "right",
        position: [pageWidth - marginX - 50, pageHeight - marginY - 4.5],
        baseline: "middle",
    });
}

function proofsList(doc, proofs) {
    var vaccinations = getEuropeanProofs(proofs);
    var listItems = vaccinations.map(function (proof) {
        if (isVaccination(proof)) {
            return (
                t(
                    doc.locale,
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
            return t(doc.local, "cover.recoveryProof");
        }
        return t(doc.local, "cover.otherProof");
    });

    var proofsList = doc._pdf.struct("L", function () {
        doc._pdf
            .font("ROSansRegular")
            .list(listItems, (marginX + 3) * dpmm, null, {
                bulletRadius: 2,
                textIndent: 6 * dpmm,
                lineGap: 2,
            });
    });

    return proofsList;
}
