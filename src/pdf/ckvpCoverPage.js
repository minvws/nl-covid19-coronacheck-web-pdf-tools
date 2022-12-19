import { t } from "../i18n/index.js";
import {
    kix,
    ROSansWebTextRegular,
    ROSansWebTextBold,
    ROSansWebTextItalic,
} from "../assets/fonts.js";
import { formatSalutation, formatAddress, formatKixCode } from "../postal.js";
import { drawText, drawLogoMinVwsA4 } from "./draw.js";
import { structDynamicList } from "./struct.js";

// var pageHeight = 297;
var pageWidth = 210;
var marginLeft = 20;
var addressTop = 57;
var retourAddressLeft = 150;
var retourAddressTop = 61.5;
var retourAddressWidth = 40;
var metaTop = 108;
var bodyTop = 126;
var bodyWidth = pageWidth - 2 * marginLeft;
var pageNumberTop = 275;
var pageNumberLeft = pageWidth - marginLeft - 30;

var fontSizeStandard = 10;
var fontSizeSmall = 6.5;
var fontSizeKix = 10;
var fontSizePagination = 9;

var lineSpace = 1;
var dpmm = 72 / 25.4; // dots per mm at 72dpi
var rawLineGap = lineSpace * dpmm;

var months = [
    "Januari",
    "Februari",
    "Maart",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "December",
];

/**
 * @param {import("./document.js").Document} doc
 * @param {Object} args
 * @param {import("../postal.js").Address} args.address
 * @param {import("../types").Proof[]} args.allProofs
 * @param {Date|number} args.createdAt
 * @param {number} [args.packageNumber]
 * @param {number} [args.totalPackages]
 * @param {number} [args.pageNumber]
 * @param {number} [args.totalPages]
 * @param {1|2|3} [args.version]
 */
export function addCkvpCoverPage(doc, args) {
    doc.addPart(function () {
        doc.loadFont("ROSansRegular", ROSansWebTextRegular);
        doc.loadFont("ROSansBold", ROSansWebTextBold);
        doc.loadFont("ROSansItalic", ROSansWebTextItalic);
        doc.loadFont("kix", kix);
        doc.pdf.addStructure(structLogo(doc));
        doc.pdf.addStructure(structAddress(doc, args.address));
        doc.pdf.addStructure(structRetourAddress(doc));
        doc.pdf.addStructure(structLetterHeading(doc, args));
        doc.pdf.addStructure(structLetterBody(doc, args));
        doc.pdf.addStructure(structPageNumber(doc, args));
    });
}

/**
 * @param {import("./document.js").Document} doc
 */
function structLogo(doc) {
    return doc.pdf.struct(
        "Figure",
        { alt: t(doc.locale, "alt.logoMinVws") },
        function () {
            drawLogoMinVwsA4(doc, pageWidth / 2, 0);
        }
    );
}

/**
 * @param {import("./document.js").Document} doc
 * @param {import("../postal.js").Address} address
 */
function structAddress(doc, address) {
    return doc.pdf.struct("Sect", function () {
        drawText(doc, {
            text: "> Retouradres Postbus 3175 6401 DR Heerlen",
            font: "ROSansRegular",
            size: fontSizeSmall,
            position: [marginLeft + 5, addressTop],
            lineGap: 1,
        });
        doc.pdf.moveDown(0.2);
        var addressLines = formatAddress(address);
        for (var i = 0; i < addressLines.length; i++) {
            drawText(doc, {
                text: addressLines[i],
                font: "ROSansRegular",
                size: fontSizeStandard,
                position: [marginLeft + 5, null],
                lineGap: 1,
            });
        }
        doc.pdf.moveDown(0.5);
        drawText(doc, {
            text: formatKixCode(address),
            font: "kix",
            size: fontSizeKix,
            position: [marginLeft + 5, null],
        });
    });
}

/**
 * @param {import("./document.js").Document} doc
 */
function structRetourAddress(doc) {
    return doc.pdf.struct("Sect", function () {
        drawText(doc, {
            text: "Ministerie van Volksgezondheid, Welzijn en Sport",
            font: "ROSansBold",
            size: fontSizeSmall,
            position: [retourAddressLeft, retourAddressTop],
            width: retourAddressWidth,
            lineGap: 1,
        });
        doc.pdf.moveDown();
        drawText(doc, {
            text: "t.a.v. ScanPlaza, kamer 4.031\nPostbus 20350\n2500 EJ  Den Haag",
            font: "ROSansRegular",
            size: fontSizeSmall,
            position: [retourAddressLeft, null],
            width: retourAddressWidth,
            lineGap: 1,
        });
        doc.pdf.moveDown();
        doc.pdf.moveDown();
        drawText(doc, {
            text: "Correspondentie uitsluitend richten aan het hierboven vermelde postadres met vermelding van de datum en het kenmerk van deze brief.",
            font: "ROSansItalic",
            size: fontSizeSmall,
            position: [retourAddressLeft, null],
            width: retourAddressWidth,
            lineGap: 1,
        });
    });
}

/**
 * @param {import("./document.js").Document} doc
 * @param {Object} args
 * @param {Date|number} args.createdAt
 * @param {number} [args.packageNumber]
 * @param {number} [args.totalPackages]
 */
function structLetterHeading(doc, args) {
    return doc.pdf.struct("Sect", function () {
        drawText(doc, {
            text: "Datum",
            font: "ROSansRegular",
            size: fontSizeStandard,
            position: [marginLeft, metaTop],
            continued: true,
            lineGap: 1,
        });
        drawText(doc, {
            text: dateString(new Date(args.createdAt)),
            font: "ROSansRegular",
            size: fontSizeStandard,
            position: [marginLeft + 20, null],
            lineGap: 1,
        });
        drawText(doc, {
            text: "Betreft",
            font: "ROSansRegular",
            size: fontSizeStandard,
            position: [marginLeft, null],
            continued: true,
            lineGap: 1,
        });
        drawText(doc, {
            text: "Coronabewijzen",
            font: "ROSansRegular",
            size: fontSizeStandard,
            position: [marginLeft + 20, null],
            lineGap: 1,
        });
        if (args.totalPackages && args.totalPackages > 1) {
            drawText(doc, {
                text: "Deel",
                font: "ROSansRegular",
                size: fontSizeStandard,
                position: [marginLeft, null],
                continued: true,
                lineGap: 1,
            });
            drawText(doc, {
                text: args.packageNumber + " van " + args.totalPackages,
                font: "ROSansRegular",
                size: fontSizeStandard,
                position: [marginLeft + 23.5, null],
                lineGap: 1,
            });
        }
    });
}

/**
 * @param {import("./document.js").Document} doc
 * @param {Object} args
 * @param {import("../postal.js").Address} args.address
 * @param {import("../types").Proof[]} args.allProofs
 * @param {Date|number} args.createdAt
 * @param {number} [args.packageNumber]
 * @param {number} [args.totalPackages]
 * @param {1|2|3} [args.version]
 */
function structLetterBody(doc, args) {
    function paragraph(text, top, space, indent) {
        drawText(doc, {
            text: text,
            font: "ROSansRegular",
            size: fontSizeStandard,
            position: [marginLeft + (indent || 0), top || null],
            width: bodyWidth - (indent || 0),
            lineGap: 1,
        });
        doc.pdf.moveDown(space || lineSpace);
    }

    function heading(text, indent) {
        drawText(doc, {
            text: text,
            font: "ROSansBold",
            size: fontSizeStandard,
            position: [marginLeft + (indent || 0), null],
            width: bodyWidth - (indent || 0),
            lineGap: 1,
        });
    }

    function list(items, itemGap) {
        doc.pdf.addStructure(
            structDynamicList(doc, {
                font: "ROSansRegular",
                size: fontSizeStandard,
                indent: 5,
                position: [marginLeft, null],
                width: bodyWidth,
                lineGap: 1,
                itemGap:
                    typeof itemGap === "undefined" ? lineSpace / 2 : itemGap,
                drawLabel: function (_n, x, y) {
                    doc.pdf.font("ROSansRegular");
                    doc.pdf.fillColor("#000000");
                    doc.pdf.text("  •  ", x, y);
                },
                items: items,
            })
        );
    }

    return doc.pdf.struct("Sect", function () {
        paragraph(formatSalutation(args.address) + ",", bodyTop);
        if (args.allProofs.length && args.version === 1) {
            paragraph(
                "Bij deze brief zitten de coronabewijzen die u bij ons heeft aangevraagd."
            );
            paragraph(
                "Bij de brief zit ook een pagina met een lettercombinatie. Daarmee kunt u de papieren bewijzen in de CoronaCheck-app zetten. Bewaar de pagina met de lettercombinatie goed, veilig en gescheiden van uw bewijzen."
            );
            paragraph(
                "Heeft u nog maar 1 vaccinatie gekregen met Pfizer of Moderna? Dan bent u vaak nog niet volledig gevaccineerd. U ontvangt dan alleen een coronabewijs dat u in sommige gevallen al kunt gebruiken voor reizen binnen Europa. Op coronacheck.nl/reizen vindt u alle reisadviezen per land die nu gelden. Een corona-toegangsbewijs dat geldig is in Nederland, krijgt u pas als u volledig gevaccineerd bent."
            );
            heading("Kloppen uw gegevens niet?");
            paragraph(
                "Neem dan contact op met de zorgverlener die u geprikt of getest heeft. Dat kan de GGD, uw huisarts of arts van uw zorginstelling zijn. Zij kunnen u helpen uw gegevens te wijzigingen en een bewijs op papier te maken."
            );
            paragraph(
                "Bent u geprikt door de GGD? Dan kunt u hiervoor bellen naar 0800 - 5090. Zij kunnen helpen uw gegevens te wijzigen en uw bewijs opnieuw op te sturen."
            );
        } else if (args.allProofs.length && args.version === 2) {
            paragraph(
                "Bij deze brief zitten de papieren coronabewijzen die u bij ons heeft aangevraagd."
            );
            heading("Nederlands bewijs");
            paragraph(
                "In Nederland krijgt u een vaccinatiebewijs als u in de afgelopen 270 dagen volledig bent gevaccineerd, of als u een boostervaccinatie heeft gehad. Een Nederlands herstelbewijs krijgt u alleen als u in de afgelopen 180 dagen een positieve test heeft gehad."
            );
            heading("Internationaal bewijs");
            paragraph(
                "U krijgt een internationaal bewijs voor uw laatste vaccinatie-dosis. En een herstelbewijs als u in de afgelopen 180 dagen positief bent getest met een PCR test. Controleer altijd voor vertrek welk bewijs u nodig heeft in het land dat u bezoekt door te kijken op coronacheck.nl/reizen of te bellen naar +31 247 247 247."
            );
            heading("Geldigheid van uw papieren coronabewijs");
            paragraph(
                "Een Nederlands papieren bewijs is 90 dagen geldig. U kunt op het Nederlandse bewijs zien tot wanneer het papieren bewijs geldig is. U kunt een nieuw papieren bewijs aanvragen door te bellen naar 0800-1421."
            );
            paragraph(
                "U kunt uw bewijs ook in de CoronaCheck-app op uw telefoon zetten. Dan is uw bewijs langer geldig. Bij deze brief zit een pagina met een lettercombinatie en uitleg. Bewaar de pagina met de lettercombinatie goed, veilig en gescheiden van uw bewijzen."
            );
            heading("Kloppen uw gegevens niet?");
            paragraph(
                "Neem dan contact op met de zorgverlener die u geprikt of getest heeft. Dat kan de GGD, uw huisarts of arts van uw zorginstelling zijn. Zij kunnen u helpen uw gegevens te wijzigingen en een bewijs op papier te maken."
            );
            paragraph(
                "Bent u geprikt door de GGD? Dan kunt u hiervoor bellen naar 0800 - 5090. Zij kunnen helpen uw gegevens te wijzigen en uw bewijs opnieuw op te sturen."
            );
        } else if (args.allProofs.length) {
            paragraph(
                "Bij deze brief zitten de papieren coronabewijzen die u bij ons heeft aangevraagd."
            );
            paragraph(
                "Het coronatoegangsbewijs voor toegang in Nederland wordt op dit moment niet meer gebruikt. Daarom ontvangt u alleen uw internationale bewijzen om mee te reizen."
            );
            heading("Internationaal bewijs om mee te reizen");
            paragraph(
                "U krijgt internationale bewijzen voor al uw vaccinaties. En herstelbewijzen als u in de afgelopen 180 dagen positief bent getest. Controleer altijd voor vertrek welk bewijs u nodig heeft in het land dat u bezoekt op \n coronacheck.nl/reizen. Of u kunt bellen naar +31 247 247 247."
            );
            heading("CoronaCheck-app");
            paragraph(
                "U kunt uw bewijzen ook in de CoronaCheck-app op uw telefoon zetten. Bij deze brief zit een pagina met een lettercombinatie en uitleg. Bewaar de pagina met de lettercombinatie goed, veilig en gescheiden van uw bewijzen."
            );
            if (args.totalPackages && args.totalPackages > 1) {
                heading("Meer dan 3 bewijzen?");
                paragraph(
                    "U heeft " +
                        args.allProofs.length +
                        " bewijzen aangevraagd, deze worden in " +
                        args.totalPackages +
                        " delen verzonden."
                );
            }
            heading("Kloppen uw gegevens niet?");
            paragraph(
                "Neem dan contact op met de zorgverlener die u geprikt of getest heeft. Dat kan de GGD, uw huisarts of arts van uw zorginstelling zijn. Zij kunnen u helpen uw gegevens te wijzigingen en de bewijzen op papier aan te vragen."
            );
            paragraph(
                "Bent u geprikt door de GGD? Dan kunt u hiervoor bellen naar 0800 - 5090. Zij kunnen helpen uw gegevens te wijzigen en uw bewijzen opnieuw op te sturen."
            );
        } else if (args.version <= 2) {
            paragraph(
                "U heeft ons gevraagd uw coronabewijzen per post op te sturen. We kunnen u helaas geen coronabewijzen toesturen. In deze brief leggen we uit hoe dat komt. "
            );
            heading("Waarom ontvangt u geen coronabewijzen?");
            paragraph(
                "Hieronder staan de mogelijke redenen waarom u geen coronabewijzen heeft ontvangen.",
                null,
                lineSpace / 2
            );

            list([
                function (x, y, width) {
                    doc.pdf.font("ROSansItalic");
                    doc.pdf.text(
                        "U bent niet gevaccineerd, en u bent niet positief getest op corona.",
                        x,
                        y,
                        { width: width, lineGap: rawLineGap }
                    );
                },
                function (x, y, width) {
                    doc.pdf.font("ROSansItalic");
                    doc.pdf.text(
                        "U bent niet gevaccineerd. U bent wél hersteld van corona, maar de positieve test is langer dan 180 dagen geleden afgenomen. ",
                        x,
                        y,
                        { width: width, continued: true, lineGap: rawLineGap }
                    );
                    doc.pdf.font("ROSansRegular");
                    doc.pdf.text(
                        "De test is niet meer geldig. Deze kunt u dus niet gebruiken voor de aanvraag van uw coronabewijzen.",
                        { width: width, lineGap: rawLineGap }
                    );
                },
                function (x, y, width) {
                    doc.pdf.font("ROSansItalic");
                    doc.pdf.text(
                        "U bent in de afgelopen 3 dagen gevaccineerd. Of u bent in de afgelopen 30 uur positief op corona getest. ",
                        x,
                        y,
                        { width: width, continued: true, lineGap: rawLineGap }
                    );
                    doc.pdf.font("ROSansRegular");
                    doc.pdf.text(
                        "Hierdoor staan uw gegevens misschien nog niet in het systeem. Vraag over een paar dagen opnieuw uw coronabewijzen aan.",
                        { width: width, lineGap: rawLineGap }
                    );

                    doc.pdf.moveDown(lineSpace / 2);
                },
            ]);
            heading("Gelden de redenen hierboven niet voor u?");
            paragraph(
                "Misschien staan uw gegevens dan niet goed in het systeem. De oplossing hiervoor hangt af van uw situatie. Welke situatie geldt voor u?",
                null,
                lineSpace / 2
            );
            list([
                function (x, y, width) {
                    doc.pdf.font("ROSansItalic");
                    doc.pdf.text("U bent door de GGD gevaccineerd. ", x, y, {
                        width: width,
                        continued: true,
                        lineGap: rawLineGap,
                    });
                    doc.pdf.font("ROSansRegular");
                    doc.pdf.text(
                        "Bel de GGD via 0800 - 5090. Zij controleren of uw gegevens goed staan en helpen u verder.",
                        { width: width, lineGap: rawLineGap }
                    );
                },
                function (x, y, width) {
                    doc.pdf.font("ROSansItalic");
                    doc.pdf.text(
                        "U bent door iemand anders dan de GGD gevaccineerd. ",
                        x,
                        y,
                        { width: width, continued: true, lineGap: rawLineGap }
                    );
                    doc.pdf.font("ROSansRegular");
                    doc.pdf.text(
                        "Neem contact op met de zorgverlener die u heeft gevaccineerd. Dat kan uw huisarts, arts van het ziekenhuis of een zorginstelling zijn. Zij controleren of uw gegevens goed staan en helpen u verder.",
                        { width: width, lineGap: rawLineGap }
                    );
                },
                function (x, y, width) {
                    doc.pdf.font("ROSansItalic");
                    doc.pdf.text("U bent positief getest op corona. ", x, y, {
                        width: width,
                        continued: true,
                        lineGap: rawLineGap,
                    });
                    doc.pdf.font("ROSansRegular");
                    doc.pdf.text(
                        "Bel de GGD via 0800 - 5090. Zij controleren of uw gegevens goed staan en helpen u verder.",
                        { width: width, lineGap: rawLineGap }
                    );
                    doc.pdf.moveDown(lineSpace / 2);
                },
            ]);
        } else {
            paragraph(
                "U heeft ons gevraagd uw coronabewijzen per post op te sturen. We kunnen u helaas geen coronabewijzen toesturen. In deze brief leggen we uit hoe dat komt. ",
                null,
                lineSpace / 2
            );
            heading("Waarom ontvangt u geen coronabewijzen?");
            paragraph(
                "Het coronatoegangsbewijs voor toegang tot plekken in Nederland wordt op dit moment niet meer gebruikt. Daarom ontvangt u geen Nederlands bewijs. Dat u ook geen internationaal bewijs ontvangt kan de volgende redenen hebben:",
                null,
                lineSpace / 2
            );

            list(
                [
                    function (x, y, width) {
                        doc.pdf.font("ROSansItalic");
                        doc.pdf.text(
                            "U bent niet gevaccineerd, en u bent niet positief getest op corona.",
                            x,
                            y,
                            { width: width, lineGap: rawLineGap }
                        );
                    },
                    function (x, y, width) {
                        doc.pdf.font("ROSansItalic");
                        doc.pdf.text(
                            "U bent niet gevaccineerd. U bent wél hersteld van corona, maar de positieve PCR test is langer dan 180 dagen geleden afgenomen. ",
                            x,
                            y,
                            {
                                width: width,
                                continued: true,
                                lineGap: rawLineGap,
                            }
                        );
                        doc.pdf.font("ROSansRegular");
                        doc.pdf.text(
                            "De test is niet meer geldig. Deze kunt u dus niet gebruiken voor de aanvraag van uw coronabewijzen.",
                            { width: width, lineGap: rawLineGap }
                        );
                    },
                    function (x, y, width) {
                        doc.pdf.font("ROSansItalic");
                        doc.pdf.text(
                            "U bent in de afgelopen 3 dagen gevaccineerd. Of u bent in de afgelopen 30 uur positief getest op corona met een PCR test. ",
                            x,
                            y,
                            {
                                width: width,
                                continued: true,
                                lineGap: rawLineGap,
                            }
                        );
                        doc.pdf.font("ROSansRegular");
                        doc.pdf.text(
                            "Hierdoor staan uw gegevens misschien nog niet in het systeem. Vraag over een paar dagen opnieuw uw coronabewijzen aan.",
                            { width: width, lineGap: rawLineGap }
                        );

                        doc.pdf.moveDown(lineSpace / 2);
                    },
                ],
                lineSpace / 4
            );
            heading("Gelden de redenen hierboven niet voor u?");
            paragraph(
                "Misschien staan uw gegevens dan niet goed in het systeem. De oplossing hiervoor hangt af van uw situatie. Welke situatie geldt voor u?",
                null,
                lineSpace / 2
            );
            list(
                [
                    function (x, y, width) {
                        doc.pdf.font("ROSansItalic");
                        doc.pdf.text(
                            "U bent door de GGD gevaccineerd. ",
                            x,
                            y,
                            {
                                width: width,
                                continued: true,
                                lineGap: rawLineGap,
                            }
                        );
                        doc.pdf.font("ROSansRegular");
                        doc.pdf.text(
                            "Bel de GGD via 0800 - 5090. Zij controleren of uw gegevens goed staan en helpen u verder.",
                            { width: width, lineGap: rawLineGap }
                        );
                    },
                    function (x, y, width) {
                        doc.pdf.font("ROSansItalic");
                        doc.pdf.text(
                            "U bent door iemand anders dan de GGD gevaccineerd. ",
                            x,
                            y,
                            {
                                width: width,
                                continued: true,
                                lineGap: rawLineGap,
                            }
                        );
                        doc.pdf.font("ROSansRegular");
                        doc.pdf.text(
                            "Neem contact op met de zorgverlener die u heeft gevaccineerd. Dat kan uw huisarts, arts van het ziekenhuis of een zorginstelling zijn. Zij controleren of uw gegevens goed staan en helpen u verder.",
                            { width: width, lineGap: rawLineGap }
                        );
                    },
                    function (x, y, width) {
                        doc.pdf.font("ROSansItalic");
                        doc.pdf.text(
                            "U bent positief getest op corona. ",
                            x,
                            y,
                            {
                                width: width,
                                continued: true,
                                lineGap: rawLineGap,
                            }
                        );
                        doc.pdf.font("ROSansRegular");
                        doc.pdf.text(
                            "Bel de GGD via 0800 - 5090. Zij controleren of uw gegevens goed staan en helpen u verder.",
                            { width: width, lineGap: rawLineGap }
                        );
                        doc.pdf.moveDown(lineSpace / 2);
                    },
                ],
                lineSpace / 4
            );
        }
        heading("Heeft u nog vragen over corona?");
        paragraph(
            "Heeft u nog vragen over corona?Bel ons via 0800 - 1421. Dit nummer is iedere werkdag open van 08.00 tot 18.00 uur. Wij helpen u graag verder"
        );
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

/**
 * @param {Date} date
 * @returns {string}
 */
function dateString(date) {
    return months[date.getMonth()] + " " + date.getFullYear();
}
