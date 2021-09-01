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
    drawList,
    drawLogoRijksoverheidA4,
    drawText,
    drawQrSvg,
} from "./draw.js";
import {
    getSortedVaccinations,
    getVaccinationStatus,
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
    var vaccinationStatus = getVaccinationStatus(proofs, createdAt);
    if (vaccinationStatus === "unvaccinated" || vaccinationStatus === "single-dose") {
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
                });
            }),
            doc._pdf.struct("P", function () {
                drawText(doc, {
                    text: "\n" + t(doc.locale, "cover.intro"),
                    font: "ROSansRegular",
                    size: fontSizeStandard,
                    width: textWidth,
                });
            }),
            doc._pdf.struct("Sect", [
                doc._pdf.struct("H", function () {
                    drawText(doc, {
                        text: "\n" + t(doc.locale, "cover.yourProofs.title"),
                        font: "ROSansBold",
                        size: fontSizeStandard,
                        width: textWidth,
                    });
                }),
                vaccinationsList(doc, proofs),
            ]),
            doc._pdf.struct("Sect", [
                doc._pdf.struct("H", function () {
                    drawText(doc, {
                        text: "\n" + t(doc.locale, "cover.whichCode.title"),
                        font: "ROSansBold",
                        size: fontSizeStandard,
                        position: [marginX, null],
                        width: textWidth,
                    });
                }),
                doc._pdf.struct("P", function () {
                    var vaccinationStatus = getVaccinationStatus(proofs, createdAt);
                    var text = t(doc.locale, "cover.whichCode."+vaccinationStatus);
                    if (!text) throw new Error("Unhandled vaccination status "+vaccinationStatus);

                    drawText(doc, {
                        text: text,
                        font: "ROSansRegular",
                        size: fontSizeStandard,
                        width: textWidth,
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
        font: "RobotoRegular",
        size: fontSizeStandard,
        width: 50,
        align: "right",
        position: [pageWidth - marginX - 50, pageHeight - marginY - 4.5],
        baseline: "middle",
    });
}

function vaccinationsList(doc, proofs) {
    var vaccinations = getSortedVaccinations(proofs);
    var listItems = vaccinations.map(function (vaccination) {
        return (
            t(
                doc.locale,
                "cover.dose." +
                    (vaccination.totalDoses > 3
                        ? "extra"
                        : vaccination.totalDoses)
            ) +
            " (" +
            vaccination.doseNumber +
            "/" +
            vaccination.totalDoses +
            ")"
        );
    });

    var vaccinationsList = doc._pdf.struct("L", function () {
        doc._pdf.moveDown(0.5);
        doc._pdf
            .font("ROSansRegular")
            .list(listItems, (marginX + 3) * dpmm, null, {
                bulletRadius: 2,
                textIndent: 6 * dpmm,
            });
    });

    return vaccinationsList;
}
