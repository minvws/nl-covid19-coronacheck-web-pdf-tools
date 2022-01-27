import { t } from "../i18n/index.js";
import {
    MontserratBold,
    ROSansWebTextRegular,
    ROSansWebTextBold,
} from "../assets/fonts.js";
import { qrDataToSvg, qrSvgSize } from "../qr.js";
import { formatLocalDateTime } from "../date.js";
import { getProofDetails } from "../proof/details.js";
import {
    drawImage,
    drawLogoCoronaCheck,
    drawFlagEU,
    drawFlagNL,
    drawFoldInstructions,
    drawBackgroundArtifact,
    drawLineArtifact,
    drawText,
    drawQrSvg,
} from "./draw.js";
import { logoRijksoverheidA5 } from "../assets/img.js";
import { structFigure, structText, structList } from "./struct.js";

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
var flagHeight = 45;
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
var coronacheckLogoTop =
    questionsFrameTop + questionsFrameHeight - marginQuestionsFrame - 9;
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
var footerMargin = 5.65;
var footerHeight = 7.4;
var footerPadding = 2.1;
var fontSizeFooter = 8;

/**
 * @param {import("./document.js").Document} doc
 * @param {import("../types").Proof} proof
 * @param {Date|number} createdAt
 * args.nlPrintIssuedOn and args.nlKeyId are DEPRECATED
 */
export function addProofPage(doc, proof, createdAt) {
    var structProof = proof.territory === "nl" ? structNlProof : structEuProof;
    doc.addPart(function () {
        return qrDataToSvg(
            proof.qr,
            partWidthProofSection,
            proof.territory
        ).then(function (qrSvg) {
            drawFoldLineHorizontal(doc);
            drawFoldLineVertical(doc);
            if (proof.territory === "nl") {
                drawQuestionsInfoFrame(doc);
                if (proof.keyIdentifier) {
                    drawNlFooterBar(doc);
                }
            }
            doc.loadFont("MontserratBold", MontserratBold);
            doc.loadFont("ROSansRegular", ROSansWebTextRegular);
            doc.loadFont("ROSansBold", ROSansWebTextBold);
            doc.addStruct("Art", [
                structLogoRijksoverheid(doc),
                structProof(doc, qrSvg, proof, createdAt),
            ]);
        });
    });
}

function structNlProof(doc, qrSvg, proof, createdAt) {
    var instructionsContent = [
        structInstructionsHeading(doc),
        structFoldInstructions(doc),
        structInstructionsList(doc, "nl.instructions"),
        structNlQuestionsPanel(doc),
    ];

    var proofContent = [
        structProofTitle(doc, "nl.qrTitle"),
        structNlQrSection(doc, qrSvg),
        structNlDetailsSection(doc, proof, createdAt),
    ];

    var content = [
        structNlTitle(doc),
        structIntro(doc, "nl"),
        structFlag(doc, "nl"),
        doc.pdf.struct("Sect", instructionsContent),
        doc.pdf.struct("Sect", proofContent),
    ];

    if (proof.keyIdentifier) {
        content.push(structNlFooter(doc));
    }

    return doc.pdf.struct("Sect", content);
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
            structValidUntil(doc, proof.validUntil),
            structValidUntilInstructions(doc)
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

    return doc.pdf.struct("Sect", [
        structEuTitle(doc, proof),
        structIntro(doc, "eu"),
        structFlag(doc, "eu"),
        doc.pdf.struct("Sect", instructionsContent),
        doc.pdf.struct("Sect", proofContent),
    ]);
}

function structNlTitle(doc) {
    return structText(doc, "H1", {
        text: t(doc.locale, "nl.title"),
        font: "MontserratBold",
        size: fontSizeH1,
        color: titleColor,
        position: [marginLeftIntro, leftPartTop],
        width: partWidthIntro,
        align: "center",
    });
}

function structEuTitle(doc, proof) {
    var text =
        proof.eventType == "vaccination"
            ? t(doc.locale, "eu.vaccination.title", {
                  doseNumber: proof.doseNumber,
                  totalDoses: proof.totalDoses,
              })
            : t(doc.locale, "eu." + proof.eventType + ".title");
    return structText(doc, "H1", {
        text: text,
        font: "MontserratBold",
        size: fontSizeH1,
        color: titleColor,
        position: [marginLeftIntro, leftPartTop],
        width: partWidthIntro,
        align: "center",
    });
}

function structIntro(doc, territory) {
    return structText(doc, "P", {
        text: "\n" + t(doc.locale, territory + ".intro"),
        font: "ROSansRegular",
        size: fontSizeStandard,
        position: [marginLeftIntro, null],
        width: partWidthIntro,
        // NB: "center" alignment only works if the text has no hyperlinks
        align: territory === "nl" ? "center" : "left",
        lineGap: 1,
    });
}

function structFlag(doc, territory) {
    return structFigure(
        doc,
        {
            x: flagLeft,
            y: territory == "nl" ? flagTopNl : flagTopEu,
            width: flagWidth,
            height: flagHeight,
            alt: t(doc.locale, territory + ".alt.flag"),
        },
        function () {
            territory == "nl"
                ? drawFlagNL(doc, flagLeft, flagTopNl, flagWidth)
                : drawFlagEU(doc, flagLeft, flagTopEu, flagWidth);
        }
    );
}

function structInstructionsHeading(doc) {
    return structText(doc, "H2", {
        text: t(doc.locale, "instructions"),
        font: "MontserratBold",
        size: fontSizeH2,
        color: titleColor,
        position: [rightPartLeft, rightPartTop],
        width: partWidth,
    });
}

function structInstructionsList(doc, listKey, replacements) {
    return structList(doc, {
        items: t(doc.locale, listKey, replacements).split("\n\n"),
        font: "ROSansRegular",
        size: fontSizeStandard,
        position: [rightPartLeft, 23],
        width: partWidth,
        lineGap: 1,
        emptyLineBetweenItems: true,
    });
}

function drawFoldLineHorizontal(doc) {
    drawLineArtifact(doc, {
        x1: 0,
        y1: pageHeight / 2,
        x2: pageWidth,
        y2: pageHeight / 2,
        color: "#1c1c1c",
    });
}

function drawFoldLineVertical(doc) {
    drawLineArtifact(doc, {
        x1: pageWidth / 2,
        y1: 0,
        x2: pageWidth / 2,
        y2: pageHeight,
        color: "#e0e0de",
    });
}

function drawQuestionsInfoFrame(doc) {
    drawBackgroundArtifact(
        doc,
        rightPartLeft,
        questionsFrameTop,
        partWidth,
        questionsFrameHeight
    );
}

function drawNlFooterBar(doc) {
    drawBackgroundArtifact(
        doc,
        footerMargin,
        pageHeight - footerMargin - footerHeight,
        pageWidth - 2 * footerMargin,
        footerHeight,
        0.5,
        "#154273"
    );
}

function structLogoRijksoverheid(doc) {
    // The logo scaled to 70% for A5 as specified by rijkshuisstijl.nl.
    var x = pageWidth / 4 - 4.55;
    var y = 0;
    var width = 9.1;
    var height = 39;
    var alt = t(doc.locale, "alt.logoRijksoverheid");
    var image = logoRijksoverheidA5;
    return structFigure(
        doc,
        { x: x, y: y, width: width, height: height, alt: alt },
        function () {
            drawImage(doc, { x: x, y: y, width: width, image: image });
        }
    );
}

function structFoldInstructions(doc) {
    var alt = t(doc.locale, "alt.foldInstructions");
    return structFigure(
        doc,
        { x: 169, y: 8, width: 32, height: 9, alt: alt },
        function () {
            drawFoldInstructions(doc, 169, 8, 32);
        }
    );
}

function structNlQuestionsPanel(doc) {
    return doc.pdf.struct("Sect", [
        structText(doc, "H3", {
            text: t(doc.locale, "questions"),
            font: "MontserratBold",
            size: fontSizeH3,
            color: titleColor,
            position: [
                questionsFrameInnerLeft,
                questionsFrameTop + marginQuestionsFrame + 1,
            ],
            width: questionsFrameInnerWidth,
            lineGap: 5,
        }),
        structText(doc, "P", {
            text: t(doc.locale, "questionsContent"),
            font: "ROSansRegular",
            size: fontSizeStandard,
            position: [questionsFrameInnerLeft, null],
            width: questionsFrameInnerWidth,
            lineGap: 1,
        }),
        structFigure(
            doc,
            {
                x: questionsFrameInnerLeft,
                y: coronacheckLogoTop,
                width: 46,
                height: 9,
                alt: t(doc.locale, "alt.logoCoronacheck"),
            },
            function () {
                var x = questionsFrameInnerLeft;
                var y = coronacheckLogoTop;
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
    var contents = [
        structText(doc, "Span", {
            text: t(doc.locale, titleKey),
            font: "MontserratBold",
            size: fontSizeH2,
            color: titleColor,
            position: [marginLeftProofSection, bottomPartTop],
            width: partWidthProofSection,
            align: "center",
        }),
    ];
    if (doc.locale === "nl" && proof.territory === "eu") {
        contents.push(
            structText(doc, "Span", {
                lang: "en",
                text: t("en", "eu." + proof.eventType + ".qrTitle"),
                font: "ROSansRegular",
                size: 14,
                color: titleColor,
                position: [marginLeftProofSection, bottomPartTop + 9],
                width: partWidthProofSection,
                align: "center",
            })
        );
    }
    return doc.pdf.struct("H2", contents);
}

function structQrImage(doc, qrSvg) {
    var size = qrSvgSize(qrSvg);
    return structFigure(
        doc,
        {
            x: marginLeftProofSection,
            y: qrTop,
            width: size,
            height: size,
            alt: t(doc.locale, "alt.qr"),
        },
        function () {
            drawQrSvg(doc, qrSvg, marginLeftProofSection, qrTop);
        }
    );
}

function structNlQrSection(doc, qrSvg) {
    return doc.pdf.struct("Sect", structQrImage(doc, qrSvg));
}

function structEuQrSection(doc, qrSvg, createdAt) {
    return doc.pdf.struct("Sect", [
        structQrImage(doc, qrSvg),
        structTravelWarning(doc),
        structCreatedAt(doc, createdAt),
    ]);
}

function structTravelWarning(doc) {
    return structText(doc, "P", {
        text: t(doc.locale, "eu.travelWarning"),
        font: "ROSansRegular",
        size: 6,
        position: [marginLeftProofSection, 270],
        width: partWidthProofSection,
        emptyLineAfter: true,
    });
}

function structCreatedAt(doc, createdAt) {
    return structText(doc, "P", {
        text: t(doc.locale, "eu.createdAt", {
            time: formatLocalDateTime(createdAt),
        }),
        font: "ROSansRegular",
        size: 6,
        position: [marginLeftProofSection, null],
        width: partWidthProofSection,
    });
}

function structValidUntil(doc, validUntil) {
    return doc.pdf.struct("P", [
        structText(doc, "Span", {
            text: t(doc.locale, "eu.validUntil"),
            font: "ROSansRegular",
            size: fontSizeStandard,
            width: partWidth,
            position: [rightPartLeft, null],
            lineGap: 1,
        }),
        structText(doc, "Span", {
            text: validUntil,
            font: "ROSansBold",
            size: fontSizeStandard,
            width: partWidth,
            position: [rightPartLeft, null],
            lineGap: 1,
            emptyLineAfter: true,
        }),
    ]);
}

function structValidUntilInstructions(doc) {
    return structText(doc, "P", {
        text: t(doc.locale, "eu.createNew"),
        font: "ROSansRegular",
        size: fontSizeStandard,
        position: [rightPartLeft, null],
        width: partWidth,
        lineGap: 1,
    });
}

function structNlDetailsSection(doc, proof, createdAt) {
    var contents = [
        structText(doc, "H2", {
            text: t(doc.locale, "nl.propertiesLabel"),
            font: "MontserratBold",
            size: fontSizeH3,
            lineGap: 1,
            color: titleColor,
            position: [rightPartLeft, bottomPartTop],
            width: partWidth,
        }),
        structText(doc, "P", {
            text: t(doc.locale, "nl.userData", {
                initials: proof.initials,
                dateOfBirth: proof.birthDateStringShort,
            }),
            font: "ROSansRegular",
            size: fontSizeStandard,
            lineGap: 1,
            position: [rightPartLeft, null],
            emptyLineAfter: true,
        }),
        structText(doc, "H2", {
            text: t(doc.locale, "nl.validityLabel"),
            font: "MontserratBold",
            size: fontSizeH3,
            lineGap: 1,
            color: titleColor,
            position: [rightPartLeft, null],
            width: partWidth,
        }),
        structText(doc, "P", {
            text: t(doc.locale, "nl.validityDetails", {
                validFrom: proof.validFrom,
                validUntil: proof.validUntil,
            }),
            font: "ROSansRegular",
            size: fontSizeStandard,
            lineGap: 1,
            position: [rightPartLeft, null],
            emptyLineAfter: true,
        }),
    ];
    if (proof.keyIdentifier) {
        if (!proof.validAtMost25Hours) {
            contents.push(
                structText(doc, "P", {
                    text: t(doc.locale, "nl.maxValidityExplanation", {
                        days: "90",
                    }),
                    font: "ROSansRegular",
                    size: fontSizeStandard,
                    lineGap: 1,
                    position: [rightPartLeft, null],
                    emptyLineAfter: true,
                })
            );
        }
        contents.push(
            structText(doc, "P", {
                text: t(doc.locale, "nl.issuedOn", {
                    date: formatLocalDateTime(createdAt),
                }),
                font: "ROSansRegular",
                size: fontSizeStandard,
                lineGap: 1,
                position: [rightPartLeft, null],
            }),
            structText(doc, "P", {
                text: t(doc.locale, "nl.keyId", {
                    keyId: proof.keyIdentifier,
                }),
                font: "ROSansRegular",
                size: fontSizeStandard,
                lineGap: 1,
                position: [rightPartLeft, null],
            })
        );
    }
    return doc.pdf.struct("Sect", contents);
}

function structEuDetailsSection(doc, details, certificateNumber) {
    return doc.pdf.struct("Sect", [
        doc.pdf.struct(
            "L",
            details
                .map(function (item, i) {
                    var y = bottomPartTop + i * fieldSpacing;
                    var baseline;
                    if (doc.locale === "en") {
                        y += 0.5 * fieldSpacing;
                        baseline = "middle";
                    }
                    var label = [
                        structText(doc, "Span", {
                            text: t(
                                doc.locale,
                                "eu.userData." + item[0]
                            ).toUpperCase(),
                            font: "ROSansBold",
                            size: fontSizeSmallCaps,
                            position: [rightPartLeft, y],
                            baseline: baseline,
                            width: partWidth,
                        }),
                    ];

                    if (doc.locale !== "en") {
                        label.push(
                            doc.pdf.struct("Span", { lang: "en" }, function () {
                                doc.pdf.moveDown(0.2);
                                drawText(doc, {
                                    text: t(
                                        "en",
                                        "eu.userData." + item[0]
                                    ).toUpperCase(),
                                    font: "ROSansRegular",
                                    size: fontSizeSmallCaps,
                                });
                            })
                        );
                    }
                    return doc.pdf.struct("LI", [
                        doc.pdf.struct("Lbl", label),
                        structText(doc, "LBody", {
                            text: item[1],
                            font: "ROSansBold",
                            size: 10,
                            align: "right",
                            position: [rightPartRight - userDataColWidth, y],
                            baseline: baseline,
                            width: userDataColWidth,
                            lineGap: -0.5,
                        }),
                    ]);
                })
                .concat([
                    doc.pdf.struct("LI", [
                        doc.pdf.struct("Lbl", function () {
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
                                font: "ROSansRegular",
                                size: fontSizeTinyCaps,
                                position: [rightPartLeft, y],
                                width: partWidth,
                            });
                        }),
                        doc.pdf.struct("LBody", function () {
                            doc.pdf.moveDown(0.3);
                            drawText(doc, {
                                text: certificateNumber,
                                font: "ROSansRegular",
                                size: fontSizeTinyCaps,
                            });
                        }),
                    ]),
                ])
        ),
    ]);
}

function structNlFooter(doc) {
    var x = rightPartLeft;
    var y = pageHeight - footerMargin - footerHeight + footerPadding;
    return structText(doc, "P", {
        text: t(doc.locale, "nl.maxValidity", { days: "90" }),
        font: "ROSansBold",
        size: fontSizeFooter,
        color: "#ffffff",
        width: 100,
        height: footerHeight,
        position: [x, y],
    });
}
