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
var fontSizePagination = 9;
var textStart = 52; // 13mm below logo, as prescribed by rijkshuisstijl.nl
var titleColor = "#383836";
var pageNumberTop = 275;
var pageNumberLeft = pageWidth - marginX - 30;

/**
 * @param {import("./document.js").Document} doc
 * @param {Object} args
 * @param {import("../types").Proof[]} args.proofs - Proofs in current envelope/package
 * @param {import("../types").Proof[]} args.allProofs - All proofs of a batch
 * @param {Date|number} args.createdAt
 * @param {boolean} args.internationalProofScanned - Adapt intro text on DCC cover page if user has scanned an international DCC. NB: `false` and `undefined` have different results.
 * @param {number} [args.pageNumber]
 * @param {number} [args.totalPages]
 * @param {boolean} [args.dryRun]
 * @returns {boolean}
 */
export function addDccCoverPage(doc, args) {
    var euProofs = getEuropeanProofs(args.proofs);
    var euAllProofs = getEuropeanProofs(args.allProofs);
    var vaccinationStatus = getVaccinationStatus(euAllProofs, args.createdAt);
    if (
        euProofs.length < 2 ||
        vaccinationStatus === "unvaccinated" ||
        vaccinationStatus === "single-dose"
    ) {
        return false;
    }

    if (args.dryRun) {
        return true;
    }

    doc.addPart(function () {
        doc.loadFont("MontserratBold", MontserratBold);
        doc.loadFont("ROSansRegular", ROSansWebTextRegular);
        doc.loadFont("ROSansBold", ROSansWebTextBold);

        doc.pdf.outline.addItem(t(doc.locale, "cover.title"));

        doc.addStruct("Art", [
            sectContents(
                doc,
                euProofs,
                euAllProofs,
                args.internationalProofScanned
            ),
            sectLogo(doc),
            sectIssuedOn(doc, args.createdAt),
        ]);

        doc.pdf.addStructure(structPageNumber(doc, args));
    });

    return true;
}

/**
 * @param {import("./document.js").Document} doc
 * @param {import("../types").EuropeanProof[]} euProofs
 * @param {import("../types").EuropeanProof[]} euAllProofs
 * @param {boolean} [internationalProofScanned]
 * @returns {import("pdfkit/js/pdfkit.standalone.js").PDFStructureElement}
 */
export default function sectContents(
    doc,
    euProofs,
    euAllProofs,
    internationalProofScanned
) {
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
    ];
    if (euProofs.length === euAllProofs.length) {
        contents.push(
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
            ])
        );
    } else {
        contents.push(
            doc.pdf.struct("Sect", [
                structText(doc, "H2", {
                    text:
                        "\n" +
                        t(doc.locale, "cover.multiPackage.yourProofs.title"),
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
            doc.pdf.struct("Sect", [
                structText(doc, "H2", {
                    text:
                        "\n" +
                        t(doc.locale, "cover.multiPackage.allProofs.title"),
                    font: "ROSansBold",
                    size: fontSizeStandard,
                    position: [marginX, null],
                    width: textWidth,
                    lineGap: 2,
                }),
                structList(doc, {
                    items: formatEuProofEvents(
                        euAllProofs.filter((x) => !euProofs.includes(x)),
                        doc.locale
                    ),
                    font: "ROSansRegular",
                    size: fontSizeStandard,
                    position: [marginX + 3, null],
                    label: "•",
                    indent: 6,
                    lineGap: 1,
                }),
            ])
        );
    }
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

/**
 * @param {import("./document.js").Document} doc
 * @returns {import("pdfkit/js/pdfkit.standalone.js").PDFStructureElement}
 */
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

/**
 * @param {import("./document.js").Document} doc
 * @param {Date|number} createdAt
 * @returns {import("pdfkit/js/pdfkit.standalone.js").PDFStructureElement}
 */
function sectIssuedOn(doc, createdAt) {
    return structText(doc, "P", {
        text: t(doc.locale, "cover.issuedOn", {
            date: formatLocalDate(createdAt),
        }),
        font: "ROSansRegular",
        size: fontSizePagination,
        width: 50,
        align: "right",
        position: [pageWidth - marginX - 50, pageHeight - marginY - 14.5],
        baseline: "middle",
    });
}

/**
 * @param {import("./document.js").Document} doc
 * @param {Object} args
 * @param {number} [args.pageNumber]
 * @param {number} [args.totalPages]
 */
function structPageNumber(doc, args) {
    const pageNumber = args.pageNumber ? args.pageNumber : 1;
    const totalPages = args.totalPages ? args.totalPages : 1;
    return doc.pdf.struct("Sect", function () {
        drawText(doc, {
            text: t(doc.locale, "nl.pagination", {
                pageNumber: pageNumber.toString(),
                totalPages: totalPages.toString(),
            }),
            width: 30,
            align: "right",
            font: "ROSansRegular",
            size: fontSizePagination,
            position: [pageNumberLeft, pageNumberTop],
        });
    });
}
