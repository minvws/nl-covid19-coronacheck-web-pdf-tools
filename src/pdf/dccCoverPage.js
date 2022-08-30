import { t } from "../i18n/index.js";
import {
    MontserratBold,
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
 * @param {boolean} [internationalProofScanned] - Adapt intro text on DCC cover page if user has scanned an international DCC. NB: `false` and `undefined` have different results.
 */
export function addDccCoverPage(
    doc,
    proofs,
    createdAt,
    internationalProofScanned
) {
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
        doc.loadFont("ROSansRegular", ROSansWebTextRegular);
        doc.loadFont("ROSansBold", ROSansWebTextBold);

        doc.pdf.outline.addItem(t(doc.locale, "cover.title"));

        doc.addStruct("Art", [
            sectContents(doc, euProofs, internationalProofScanned),
            sectLogo(doc),
            sectIssuedOn(doc, createdAt),
        ]);
    });
}

function sectContents(doc, euProofs, internationalProofScanned) {
    var showTotalDoseExplanation = euProofs.some(function (proof) {
        return (
            proof.eventType === "vaccination" &&
            proof.doseNumber > proof.totalDoses
        );
    });
    var introText = t(
        doc.locale,
        internationalProofScanned
            ? "cover.intro.internationalProofScanned"
            : internationalProofScanned === false
            ? "cover.intro.noInternationalProofScanned"
            : "cover.intro.maybeInternationalProofScanned"
    );
    var contents = [
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
        structText(doc, "H1", {
            text: t(doc.locale, "cover.title"),
            font: "MontserratBold",
            size: fontSizeH1,
            color: titleColor,
            position: [marginX, textStart],
            width: textWidth,
            lineGap: 2,
        }),
        structText(doc, "P", {
            text: "\n" + introText,
            font: "ROSansRegular",
            size: fontSizeStandard,
            position: [marginX, null],
            width: textWidth,
            lineGap: 2,
        }),
        doc.pdf.struct("Sect", [
            structText(doc, "H2", {
                text: "\n" + t(doc.locale, "cover.yourProofs.title"),
                font: "ROSansBold",
                size: fontSizeStandard,
                position: [marginX, null],
                width: textWidth,
                lineGap: 2,
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
    ];
    if (showTotalDoseExplanation) {
        contents.push(
            doc.pdf.struct("Sect", [
                structText(doc, "H2", {
                    text:
                        "\n" +
                        t(doc.locale, "cover.totalDoseExplanation.title"),
                    font: "ROSansBold",
                    size: fontSizeStandard,
                    position: [marginX, null],
                    width: textWidth,
                    lineGap: 2,
                }),
                structText(doc, "P", {
                    text: t(doc.locale, "cover.totalDoseExplanation.text"),
                    font: "ROSansRegular",
                    size: fontSizeStandard,
                    position: [marginX, null],
                    width: textWidth,
                    lineGap: 2,
                }),
            ])
        );
    }
    contents.push(
        doc.pdf.struct("Sect", [
            structText(doc, "H2", {
                text: "\n" + t(doc.locale, "cover.whichCode.title"),
                font: "ROSansBold",
                size: fontSizeStandard,
                position: [marginX, null],
                width: textWidth,
                lineGap: 2,
            }),
            structText(doc, "P", {
                text: t(doc.locale, "cover.whichCode.text"),
                font: "ROSansRegular",
                size: fontSizeStandard,
                position: [marginX, null],
                width: textWidth,
                lineGap: 2,
            }),
        ])
    );
    return doc.pdf.struct("Sect", contents);
}

function sectLogo(doc) {
    return structFigure(
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
    );
}

function sectIssuedOn(doc, createdAt) {
    return structText(doc, "P", {
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
