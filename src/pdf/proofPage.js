import { t } from "../i18n/index.js";
import { MontserratBold, RobotoRegular, RobotoBold } from "../assets/fonts.js";
import { qrDataToSvg } from "../qr.js";
import { formatLocalDateTime } from "../date.js";
import { getProofDetails } from "../proof/details.js";
import {
    drawLogoCoronaCheck,
    drawFlagEU,
    drawFlagNL,
    drawFoldInstructions,
    drawInfoFrame,
    drawLine,
    drawList,
    drawLogoRijksoverheidA5,
    drawText,
    drawQrSvg,
} from "./draw.js";

var pageHeight = 297;
var pageWidth = 210;
var marginLeft = 10;
var marginTop = 10;
var leftPartTop = 30;
var rightPartLeft = 0.5 * pageWidth + marginLeft;
var userDataColWidth = 50;
var rightPartRight = pageWidth - marginLeft;
var rightPartTop = marginTop;
var partWidth = 0.5 * pageWidth - 2 * marginLeft;
var bottomPartTop = 0.5 * pageHeight + marginTop;
var flagWidth = 70;
var flagTopNl = 84.5;
var flagTopEu = 90;
var flagLeft = pageWidth / 4 - flagWidth / 2;
var marginLeftIntro = flagLeft;
var partWidthIntro = flagWidth;
var marginQuestionsFrame = 4;
var questionsFrameHeight = 54;
var questionsFrameTop = pageHeight / 2 - marginLeft - questionsFrameHeight;
var questionsFrameInnerLeft = rightPartLeft + marginQuestionsFrame;
var questionsFrameInnerWidth = partWidth - 2 * marginQuestionsFrame;
var fontSizeH1 = 18;
var fontSizeH2 = 18;
var fontSizeH3 = 11;
var fontSizeStandard = 10;
var fontSizeSmallCaps = 6;
var fontSizeTinyCaps = 5;
var fieldSpacing = fontSizeSmallCaps * 1.6;
var partWidthProofSection = 80;
var marginLeftProofSection = (pageWidth / 2 - partWidthProofSection) / 2;
var qrTop = 181;
var titleColor = "#383836";

export function addProofPage(doc, proof, createdAt) {
    return qrDataToSvg(proof.qr, partWidthProofSection, proof.territory).then(
        function (qrSvg) {
            doc.loadFont("MontserratBold", MontserratBold);
            doc.loadFont("RobotoRegular", RobotoRegular);
            doc.loadFont("RobotoBold", RobotoBold);
            doc._pdf.addPage({ margin: 0, size: "A4" });
            doc._pdf.addStructure(structFoldLines(doc));
            doc._pdf.addStructure(structLogoRijksoverheid(doc));
            doc._pdf.addStructure(
                proof.territory === "nl"
                    ? structNlProof(doc, qrSvg, proof)
                    : structEuProof(doc, qrSvg, proof, createdAt)
            );
        }
    );
}

function structNlProof(doc, qrSvg, proof) {
    var instructionsContent = [
        structInstructionsHeading(doc),
        structFoldInstructions(doc),
        structInstructionsList(doc, "nl.instructions"),
        structNlQuestionsPanel(doc),
    ];

    var proofContent = [
        structProofTitle(doc, "nl.qrTitle"),
        structNlQrSection(doc, qrSvg),
        structNlDetailsSection(doc, getProofDetails(proof)),
    ];

    return doc._pdf.struct("Sect", [
        structNlTitle(doc),
        structIntro(doc, "nl"),
        structFlag(doc, "nl"),
        doc._pdf.struct("Sect", instructionsContent),
        doc._pdf.struct("Sect", proofContent),
    ]);
}

function structEuProof(doc, qrSvg, proof, createdAt) {
    var instructionsContent = [
        structInstructionsHeading(doc),
        structFoldInstructions(doc),
        structInstructionsList(doc, "eu.instructions", {
            date: proof.validUntil,
        }),
    ];

    if (proof.eventType === "vaccination") {
        instructionsContent.push(
            structValidUntilInstructions(doc, proof.validUntil)
        );
    }

    var proofContent = [
        structProofTitle(doc, proof),
        structEuQrSection(doc, qrSvg, createdAt),
        structEuDetailsSection(
            doc,
            getProofDetails(proof),
            proof.certificateNumber
        ),
    ];

    return doc._pdf.struct("Sect", [
        structEuTitle(doc, proof),
        structIntro(doc, "eu"),
        structFlag(doc, "eu"),
        doc._pdf.struct("Sect", instructionsContent),
        doc._pdf.struct("Sect", proofContent),
    ]);
}

function structNlTitle(doc) {
    return doc._pdf.struct("H", function () {
        drawText(doc, {
            text: t(doc.locale, "nl.title"),
            font: "MontserratBold",
            size: fontSizeH1,
            color: titleColor,
            position: [marginLeftIntro, leftPartTop],
            width: partWidthIntro,
            align: "center",
        });
    });
}

function structEuTitle(doc, proof) {
    var text =
        proof.eventType == "vaccination"
            ? t(doc.locale, "eu.titleVaccination", {
                  doseNumber: proof.doseNumber,
                  totalDoses: proof.totalDoses,
              })
            : t(doc.locale, "eu.title");
    return doc._pdf.struct("H", function () {
        drawText(doc, {
            text: text,
            font: "MontserratBold",
            size: fontSizeH1,
            color: titleColor,
            position: [marginLeftIntro, leftPartTop],
            width: partWidthIntro,
            align: "center",
        });
    });
}

function structIntro(doc, territory) {
    return doc._pdf.struct("P", function () {
        drawText(doc, {
            text: "\n" + t(doc.locale, territory + ".intro"),
            font: "RobotoRegular",
            size: fontSizeStandard,
            position: [marginLeftIntro, null],
            width: partWidthIntro,
            align: "center",
            lineGap: 1,
        });
    });
}

function structFlag(doc, territory) {
    return doc._pdf.struct(
        "Figure",
        { alt: t(doc.locale, territory + ".alt.flag") },
        function () {
            territory == "nl"
                ? drawFlagNL(doc, flagLeft, flagTopNl, flagWidth)
                : drawFlagEU(doc, flagLeft, flagTopEu, flagWidth);
        }
    );
}

function structInstructionsHeading(doc) {
    return doc._pdf.struct("H", function () {
        drawText(doc, {
            text: t(doc.locale, "instructions"),
            font: "MontserratBold",
            size: fontSizeH2,
            color: titleColor,
            position: [rightPartLeft, rightPartTop],
            width: partWidth,
        });
    });
}

function structInstructionsList(doc, listKey, replacements) {
    return drawList(doc, {
        items: t(doc.locale, listKey, replacements).split("\n\n"),
        font: "RobotoRegular",
        size: fontSizeStandard,
        position: [rightPartLeft, 23],
        width: partWidth,
        lineGap: 1,
    });
}

function structFoldLines(doc) {
    return doc._pdf.struct("Artifact", { type: "Layout" }, function () {
        drawLine(doc, {
            x1: 0,
            y1: pageHeight / 2,
            x2: pageWidth,
            y2: pageHeight / 2,
            color: "#1c1c1c",
        });
        drawLine(doc, {
            x1: pageWidth / 2,
            y1: 0,
            x2: pageWidth / 2,
            y2: pageHeight,
            color: "#e0e0de",
        });
    });
}

function structLogoRijksoverheid(doc) {
    return doc._pdf.struct(
        "Figure",
        { alt: t(doc.locale, "alt.logoRijksoverheid") },
        function () {
            drawLogoRijksoverheidA5(doc, 210 / 4, 0);
        }
    );
}

function structFoldInstructions(doc) {
    return doc._pdf.struct(
        "Figure",
        { alt: t(doc.locale, "alt.foldInstructions") },
        function () {
            drawFoldInstructions(doc, 169, 8, 32);
        }
    );
}

function structNlQuestionsPanel(doc) {
    return doc._pdf.struct("Sect", [
        doc._pdf.struct("Artifact", { type: "Layout" }, function () {
            drawInfoFrame(
                doc,
                rightPartLeft,
                questionsFrameTop,
                partWidth,
                questionsFrameHeight
            );
        }),
        doc._pdf.struct("H", function () {
            drawText(doc, {
                text: t(doc.locale, "questions"),
                font: "MontserratBold",
                size: fontSizeH3,
                color: titleColor,
                position: [
                    questionsFrameInnerLeft,
                    questionsFrameTop + marginQuestionsFrame + 1,
                ],
                width: questionsFrameInnerWidth,
            });
        }),
        doc._pdf.struct("P", function () {
            doc._pdf.moveDown();
            drawText(doc, {
                text: t(doc.locale, "questionsContent"),
                font: "RobotoRegular",
                size: fontSizeStandard,
                position: [questionsFrameInnerLeft, null],
                width: questionsFrameInnerWidth,
                lineGap: 1,
            });
        }),
        doc._pdf.struct(
            "Figure",
            { alt: t(doc.locale, "alt.logoCoronacheck") },
            function () {
                var x = questionsFrameInnerLeft;
                var y =
                    questionsFrameTop +
                    questionsFrameHeight -
                    marginQuestionsFrame -
                    9;
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
    ]);
}

function structProofTitle(doc, proof) {
    var titleKey =
        proof.territory === "eu"
            ? "eu." + proof.eventType + ".qrTitle"
            : "nl.qrTitle";
    return doc._pdf.struct("H", function () {
        drawText(doc, {
            text: t(doc.locale, titleKey),
            font: "MontserratBold",
            size: fontSizeH2,
            color: titleColor,
            position: [marginLeftProofSection, bottomPartTop],
            width: partWidthProofSection,
            align: "center",
        });
        if (doc.locale === "nl" && proof.territory === "eu") {
            doc._pdf.addStructure(
                doc._pdf.struct("Span", { lang: "en" }, function () {
                    drawText(doc, {
                        text: t("en", "eu." + proof.eventType + ".qrTitle"),
                        font: "RobotoRegular",
                        size: 14,
                        color: titleColor,
                        position: [marginLeftProofSection, bottomPartTop + 9],
                        width: partWidthProofSection,
                        align: "center",
                    });
                })
            );
        }
    });
}

function structQrImage(doc, qrSvg) {
    return doc._pdf.struct(
        "Figure",
        { alt: t(doc.locale, "alt.qr") },
        function () {
            drawQrSvg(doc, qrSvg, marginLeftProofSection, qrTop);
        }
    );
}

function structNlQrSection(doc, qrSvg) {
    return doc._pdf.struct("Sect", structQrImage(doc, qrSvg));
}

function structEuQrSection(doc, qrSvg, createdAt) {
    return doc._pdf.struct("Sect", [
        structQrImage(doc, qrSvg),
        structTravelWarning(doc),
        structCreatedAt(doc, createdAt),
    ]);
}

function structTravelWarning(doc) {
    return doc._pdf.struct("P", function () {
        drawText(doc, {
            text: t(doc.locale, "eu.travelWarning"),
            font: "RobotoRegular",
            size: 6,
            position: [marginLeftProofSection, 270],
            width: partWidthProofSection,
        });
    });
}

function structCreatedAt(doc, createdAt) {
    return doc._pdf.struct("P", function () {
        doc._pdf.moveDown();
        drawText(doc, {
            text: t(doc.locale, "eu.createdAt", {
                time: formatLocalDateTime(createdAt),
            }),
            font: "RobotoRegular",
            size: 6,
            width: partWidthProofSection,
        });
    });
}

function structValidUntilInstructions(doc, validUntil) {
    return doc._pdf.struct("P", function () {
        drawText(doc, {
            text: t(doc.locale, "eu.validUntil"),
            font: "RobotoRegular",
            size: fontSizeStandard,
            width: partWidth,
            position: [rightPartLeft, null],
            lineGap: 1,
        });
        drawText(doc, {
            text: validUntil,
            font: "RobotoBold",
            size: fontSizeStandard,
            width: partWidth,
            lineGap: 1,
        });
        doc._pdf.moveDown();
        drawText(doc, {
            text: t(doc.locale, "eu.createNew"),
            font: "RobotoRegular",
            size: fontSizeStandard,
            width: partWidth,
            lineGap: 1,
        });
    });
}

function structNlDetailsSection(doc, details) {
    return doc._pdf.struct("Sect", [
        doc._pdf.struct("H", function () {
            drawText(doc, {
                text: t(doc.locale, "nl.propertiesLabel"),
                font: "MontserratBold",
                size: fontSizeH3,
                color: titleColor,
                position: [rightPartLeft, bottomPartTop],
                width: partWidth,
            });
            doc._pdf.moveDown();
        }),
        doc._pdf.struct("P", function () {
            details.forEach(function (item) {
                drawText(doc, {
                    text:
                        t(doc.locale, "nl.userData." + item[0]) +
                        ": " +
                        item[1],
                    font: "RobotoRegular",
                    size: fontSizeStandard,
                });
                doc._pdf.moveDown(0.2);
            });
        }),
        doc._pdf.struct("P", function () {
            doc._pdf.moveDown(1);
            drawText(doc, {
                text: t(doc.locale, "nl.userData.privacyNote"),
                font: "RobotoRegular",
                size: fontSizeStandard,
            });
        }),
    ]);
}

function structEuDetailsSection(doc, details, certificateNumber) {
    return doc._pdf.struct("Sect", [
        doc._pdf.struct(
            "L",
            details
                .map(function (item, i) {
                    var y = bottomPartTop + i * fieldSpacing;
                    var baseline;
                    if (doc.locale === "en") {
                        y += 0.5 * fieldSpacing;
                        baseline = "middle";
                    }
                    return doc._pdf.struct("LI", [
                        doc._pdf.struct("Lbl", function () {
                            drawText(doc, {
                                text: t(
                                    doc.locale,
                                    "eu.userData." + item[0]
                                ).toUpperCase(),
                                font: "RobotoBold",
                                size: fontSizeSmallCaps,
                                position: [rightPartLeft, y],
                                baseline: baseline,
                                width: partWidth,
                            });
                            if (doc.locale !== "en") {
                                doc._pdf.addStructure(
                                    doc._pdf.struct(
                                        "Span",
                                        { lang: "en" },
                                        function () {
                                            doc._pdf.moveDown(0.2);
                                            drawText(doc, {
                                                text: t(
                                                    "en",
                                                    "eu.userData." + item[0]
                                                ).toUpperCase(),
                                                font: "RobotoRegular",
                                                size: fontSizeSmallCaps,
                                            });
                                        }
                                    )
                                );
                            }
                        }),
                        doc._pdf.struct("LBody", function () {
                            drawText(doc, {
                                text: item[1],
                                font: "RobotoBold",
                                size: 10,
                                align: "right",
                                position: [
                                    rightPartRight - userDataColWidth,
                                    y,
                                ],
                                baseline: baseline,
                                width: userDataColWidth,
                                lineGap: -0.5,
                            });
                        }),
                    ]);
                })
                .concat([
                    doc._pdf.struct("LI", [
                        doc._pdf.struct("Lbl", function () {
                            var y =
                                bottomPartTop +
                                (details.length + 0.25) * fieldSpacing;

                            var text = t(
                                doc.locale,
                                "eu.userData.certificateNumber"
                            );
                            if (doc.locale !== "en") {
                                text += " / ";
                                text += t(
                                    "en",
                                    "eu.userData.certificateNumber"
                                );
                            }

                            drawText(doc, {
                                text: text.toUpperCase(),
                                font: "RobotoRegular",
                                size: fontSizeTinyCaps,
                                position: [rightPartLeft, y],
                                width: partWidth,
                            });
                        }),
                        doc._pdf.struct("LBody", function () {
                            doc._pdf.moveDown(0.3);
                            drawText(doc, {
                                text: certificateNumber,
                                font: "RobotoRegular",
                                size: fontSizeTinyCaps,
                            });
                        }),
                    ]),
                ])
        ),
    ]);
}
