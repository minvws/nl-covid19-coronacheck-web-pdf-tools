import { t } from "../i18n/index.js";
import {
    MontserratBold,
    RobotoRegular,
    RobotoBold,
    ROSansWebTextRegular,
    ROSansWebTextBold,
} from "../assets/fonts.js";
import { logoRijksoverheidA4 } from "../assets/img.js";
import { formatLocalDate } from "../date.js";
import { drawImage, drawText, drawLogoCoronaCheck } from "./draw.js";
import { structFigure, structText, structList } from "./struct.js";
import { getEuropeanProofs, getVaccinationStatus } from "../proof/status.js";
import { formatEuProofEvents } from "../proof/format.js";

var pageHeight = 297;
var pageWidth = 210;
var marginX = 16;
var marginY = 14;
var textWidth = pageWidth - 2 * marginX;
var fontSizeH1 = 22;
var fontSizeStandard = 12;
var textStart = 52; // 13mm below logo, as prescribed by rijkshuisstijl.nl
var titleColor = "#383836";

/**
 * @param {import("./document.js").Document} doc
 * @param {import("../types").Proof[]} proofs
 * @param {Date|number} createdAt
 */
export function addDccCoverPage(doc, proofs, createdAt) {
    var euProofs = getEuropeanProofs(proofs);
    var vaccinationStatus = getVaccinationStatus(euProofs, createdAt);
    if (
        euProofs.length < 2 ||
        vaccinationStatus === "unvaccinated" ||
        vaccinationStatus === "single-dose"
    ) {
        return false;
    }

    doc.addPart(function () {
        doc.loadFont("MontserratBold", MontserratBold);
        doc.loadFont("RobotoRegular", RobotoRegular);
        doc.loadFont("RobotoBold", RobotoBold);
        doc.loadFont("ROSansRegular", ROSansWebTextRegular);
        doc.loadFont("ROSansBold", ROSansWebTextBold);

        doc.addStruct("Article", [
            doc.pdf.struct("Sect", [
                structFigure(
                    doc,
                    {
                        x: pageWidth / 2 - 6.5,
                        y: 0,
                        width: 13,
                        height: 39,
                        alt: t(doc.locale, "alt.logoRijksoverheid"),
                    },
                    function () {
                        drawImage(doc, {
                            x: pageWidth / 2 - 6.5,
                            y: 0,
                            width: 13,
                            image: logoRijksoverheidA4,
                        });
                    }
                ),
                doc.pdf.struct("H1", function () {
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
                doc.pdf.struct("P", function () {
                    drawText(doc, {
                        text: "\n" + t(doc.locale, "cover.intro"),
                        font: "ROSansRegular",
                        size: fontSizeStandard,
                        position: [marginX, null],
                        width: textWidth,
                        lineGap: 2,
                    });
                }),
                doc.pdf.struct("Sect", [
                    doc.pdf.struct("H2", function () {
                        drawText(doc, {
                            text:
                                "\n" + t(doc.locale, "cover.yourProofs.title"),
                            font: "ROSansBold",
                            size: fontSizeStandard,
                            position: [marginX, null],
                            width: textWidth,
                            lineGap: 2,
                        });
                    }),
                    structList(doc, {
                        items: formatEuProofEvents(euProofs, doc.locale),
                        font: "ROSansRegular",
                        size: fontSizeStandard,
                        position: [marginX + 3, null],
                        label: "•",
                        indent: 6,
                        lineGap: 1,
                    }),
                ]),
                doc.pdf.struct("Sect", [
                    doc.pdf.struct("H2", function () {
                        drawText(doc, {
                            text: "\n" + t(doc.locale, "cover.whichCode.title"),
                            font: "ROSansBold",
                            size: fontSizeStandard,
                            position: [marginX, null],
                            width: textWidth,
                            lineGap: 2,
                        });
                    }),
                    doc.pdf.struct("P", function () {
                        var vaccinationStatus = getVaccinationStatus(
                            euProofs,
                            createdAt
                        );
                        var text = t(
                            doc.locale,
                            "cover.whichCode." + vaccinationStatus
                        );
                        if (!text)
                            throw new Error(
                                "Unhandled vaccination status " +
                                    vaccinationStatus
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
            ]),
            doc.pdf.struct("Sect", [
                structText(doc, "P", {
                    text: "\n" + t(doc.locale, "cover.beforeTravel"),
                    font: "ROSansBold",
                    size: fontSizeStandard,
                    position: [marginX, null],
                    width: textWidth,
                    lineGap: 2,
                }),
            ]),
            structFigure(
                doc,
                {
                    x: marginX,
                    y: pageHeight - marginY - 9,
                    width: 46,
                    height: 9,
                    alt: t(doc.locale, "alt.logoCoronacheck"),
                },
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
            ),
            structText(doc, "P", {
                text: t(doc.locale, "cover.issuedOn", {
                    date: formatLocalDate(createdAt),
                }),
                font: "ROSansRegular",
                size: fontSizeStandard,
                width: 50,
                align: "right",
                position: [
                    pageWidth - marginX - 50,
                    pageHeight - marginY - 4.5,
                ],
                baseline: "middle",
            }),
        ]);
    });
}
