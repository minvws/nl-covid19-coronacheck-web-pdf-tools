import { t } from "../i18n/index.js";
import {
    MontserratBold,
    ROSansWebTextRegular,
    ROSansWebTextBold,
} from "../assets/fonts.js";
import { menuIcon } from "../assets/img.js";
import { drawLogoCoronaCheck, drawText } from "./draw.js";
import { structText, structFigure, structDynamicList } from "./struct.js";

var pageWidth = 210;
var marginTop = 28;
var marginLeft = 17;
var contentWidth = pageWidth - 2 * marginLeft;
var stepsTop = 84;
var stepsListTop = 95;
var codeTop = 152;
var codeHeight = 23;
var codeWidth = 95;
var codePadding = 8.5;
var codeBorderColor = "#727679";
var warningTop = 237;
var warningHeight = 23;
var coronacheckLogoTop = 272;
var fontSizeStandard = 10;
var fontSizeH1 = 22;
var fontSizeH2 = 14;
var fontSizeWarning = 12;
var titleColor = "#383836";
var warningBackgroundColor = "#F2F2F7";
var dpmm = 72 / 25.4; // dots per mm at 72dpi

/**
 * @param {import("./document.js").Document} doc
 * @param {string} couplingCode
 */
export function addCouplingCodePage(doc, couplingCode) {
    doc.addPart(function () {
        drawCodeBoxBorder(doc);
        drawWarningBoxBackground(doc);
        doc.loadFont("MontserratBold", MontserratBold);
        doc.loadFont("ROSansRegular", ROSansWebTextRegular);
        doc.loadFont("ROSansBold", ROSansWebTextBold);

        doc.pdf.outline.addItem("Deze bewijzen op uw telefoon gebruiken?");

        doc.addStruct("Art", [
            doc.pdf.struct("Sect", [
                structText(doc, "H1", {
                    text: "Deze bewijzen op uw telefoon gebruiken?",
                    font: "MontserratBold",
                    size: fontSizeH1,
                    color: titleColor,
                    position: [marginLeft, marginTop],
                    emptyLineAfter: true,
                }),
                structText(doc, "P", {
                    text: "U heeft nu uw coronabewijs op papier. Als u wilt is het ook mogelijk om uw papieren bewijs in de CoronaCheck-app te zetten, zodat u het bewijs op uw telefoon kan gebruiken.",
                    font: "ROSansRegular",
                    size: fontSizeStandard,
                    position: [marginLeft, null],
                    lineGap: 1,
                    width: contentWidth,
                }),
                doc.pdf.struct("Sect", [
                    structText(doc, "H2", {
                        text: "Volg deze stappen:",
                        font: "MontserratBold",
                        size: fontSizeH2,
                        color: titleColor,
                        position: [marginLeft, stepsTop],
                        emptyLineAfter: true,
                    }),
                    structDynamicList(doc, {
                        font: "ROSansRegular",
                        size: fontSizeStandard,
                        indent: 5,
                        position: [marginLeft, stepsListTop],
                        width: contentWidth,
                        items: [
                            function (x, y) {
                                doc.pdf.text(
                                    "Download en open de CoronaCheck-app",
                                    x,
                                    y
                                );
                            },
                            function (x, y) {
                                doc.pdf.text("Open het menu   ", x, y);
                                doc.pdf.image(
                                    menuIcon,
                                    x + 25 * dpmm,
                                    y + dpmm,
                                    {
                                        width: 2.5 * dpmm,
                                    }
                                );
                            },
                            function (x, y) {
                                doc.pdf
                                    .text("Ga naar ", x, y, { continued: true })
                                    .font("ROSansBold")
                                    .text("‘Papieren bewijs toevoegen’");
                            },
                            function (x, y, width) {
                                doc.pdf
                                    .text("Vul uw ", x, y, {
                                        continued: true,
                                        width: width,
                                        lineGap: 1 * dpmm,
                                    })
                                    .font("ROSansBold")
                                    .text("lettercombinatie", {
                                        continued: true,
                                        lineGap: 1 * dpmm,
                                    })
                                    .font("ROSansRegular")
                                    .text(" in en scan de ", {
                                        continued: true,
                                        lineGap: 1 * dpmm,
                                    })
                                    .font("ROSansBold")
                                    .text("internationale QR-code", {
                                        continued: true,
                                        lineGap: 1 * dpmm,
                                    })
                                    .font("ROSansRegular")
                                    .text(
                                        ". Heeft u meerdere internationale QR codes? Scan de QR-code van de vaccinatie-dosis die u in de app wilt hebben.",
                                        {
                                            lineGap: 1 * dpmm,
                                        }
                                    );
                            },
                        ],
                    }),
                    doc.pdf.struct("P", [
                        structText(doc, "Span", {
                            text: "Uw lettercombinatie: ",
                            font: "ROSansRegular",
                            size: fontSizeStandard,
                            position: [
                                marginLeft + codePadding,
                                codeTop + codeHeight / 2,
                            ],
                            baseline: "middle",
                        }),
                        structText(doc, "Span", {
                            text: couplingCode,
                            font: "ROSansRegular",
                            size: 28,
                            position: [
                                marginLeft + codeWidth / 2,
                                codeTop + codeHeight / 2,
                            ],
                            baseline: "middle",
                        }),
                    ]),
                    structText(doc, "P", {
                        text: "Let op: bewaar uw coronabewijs en lettercombinatie goed",
                        font: "ROSansBold",
                        size: fontSizeWarning,
                        position: [marginLeft, warningTop + warningHeight / 2],
                        width: contentWidth,
                        baseline: "middle",
                        align: "center",
                    }),
                ]),
            ]),
            structFigure(
                doc,
                {
                    x: marginLeft,
                    y: coronacheckLogoTop,
                    width: 46,
                    height: 9,

                    alt: t(doc.locale, "alt.logoCoronacheck"),
                },
                function () {
                    var x = marginLeft;
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
    });
}

function drawCodeBoxBorder(doc) {
    doc.pdf.markContent("Artifact", { type: "Layout" });
    doc.pdf
        .strokeColor(codeBorderColor)
        .roundedRect(
            marginLeft * dpmm,
            codeTop * dpmm,
            codeWidth * dpmm,
            codeHeight * dpmm,
            2 * dpmm
        )
        .stroke();
    doc.pdf.endMarkedContent();
}

function drawWarningBoxBackground(doc) {
    doc.pdf.markContent("Artifact", { type: "Layout" });
    doc.pdf
        .fillColor(warningBackgroundColor)
        .roundedRect(
            marginLeft * dpmm,
            warningTop * dpmm,
            contentWidth * dpmm,
            warningHeight * dpmm,
            2 * dpmm
        )
        .fill();
    doc.pdf.endMarkedContent();
}
