import { t } from "../i18n/index.js";
import {
    LiberationSansRegular,
    LiberationSansBold,
    LiberationSansItalic,
    kix,
} from "../assets/fonts.js";
import { formatSalutation, formatAddress, formatKixCode } from "../postal.js";
import { drawText, drawLogoMinVwsA4 } from "./draw.js";

// var pageHeight = 297;
var pageWidth = 210;
var marginLeft = 25;
var addressTop = 57;
var retourAddressLeft = 150;
var retourAddressTop = 61.5;
var retourAddressWidth = 40;
var metaTop = 108;
var bodyTop = 126;
var bodyWidth = 120;
var pageNumberTop = 273.75;
var pageNumberLeft = 150;

var fontSizeStandard = 9;
var fontSizeSmall = 6.5;
var fontSizeKix = 10;

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
 * @param {boolean} args.proofsFound
 * @param {Date|number} args.createdAt
 */
export function addCkvpCoverPage(doc, args) {
    doc._addPage(function () {
        doc.loadFont("LiberationSansRegular", LiberationSansRegular);
        doc.loadFont("LiberationSansBold", LiberationSansBold);
        doc.loadFont("LiberationSansItalic", LiberationSansItalic);
        doc.loadFont("kix", kix);
        doc._pdf.addPage({ margin: 0, size: "A4" });
        doc._pdf.addStructure(structLogo(doc));
        doc._pdf.addStructure(structAddress(doc, args.address));
        doc._pdf.addStructure(structRetourAddress(doc));
        doc._pdf.addStructure(structLetterHeading(doc, args.createdAt));
        doc._pdf.addStructure(structLetterBody(doc, args));
        doc._pdf.addStructure(structPageNumber(doc));
    });
}

/**
 * @param {import("./document.js").Document} doc
 */
function structLogo(doc) {
    return doc._pdf.struct(
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
    return doc._pdf.struct("Sect", function () {
        drawText(doc, {
            text: "> Retouradres Postbus 3175 6401 DR Heerlen",
            font: "LiberationSansRegular",
            size: fontSizeSmall,
            position: [marginLeft, addressTop],
            lineGap: 1,
        });
        doc._pdf.moveDown(0.2);
        var addressLines = formatAddress(address);
        for (var i = 0; i < addressLines.length; i++) {
            drawText(doc, {
                text: addressLines[i],
                font: "LiberationSansRegular",
                size: fontSizeStandard,
                position: [marginLeft, null],
                lineGap: 1,
            });
        }
        doc._pdf.moveDown(0.5);
        drawText(doc, {
            text: formatKixCode(address),
            font: "kix",
            size: fontSizeKix,
            position: [marginLeft, null],
        });
    });
}

/**
 * @param {import("./document.js").Document} doc
 */
function structRetourAddress(doc) {
    return doc._pdf.struct("Sect", function () {
        drawText(doc, {
            text: "Ministerie van Volksgezondheid, Welzijn en Sport",
            font: "LiberationSansBold",
            size: fontSizeSmall,
            position: [retourAddressLeft, retourAddressTop],
            width: retourAddressWidth,
            lineGap: 1,
        });
        doc._pdf.moveDown();
        drawText(doc, {
            text: "t.a.v. ScanPlaza, kamer 4.031\nPostbus 20350\n2500 EJ  Den Haag",
            font: "LiberationSansRegular",
            size: fontSizeSmall,
            position: [retourAddressLeft, null],
            width: retourAddressWidth,
            lineGap: 1,
        });
        doc._pdf.moveDown();
        doc._pdf.moveDown();
        drawText(doc, {
            text: "Correspondentie uitsluitend richten aan het hierboven vermelde postadres met vermelding van de datum en het kenmerk van deze brief.",
            font: "LiberationSansItalic",
            size: fontSizeSmall,
            position: [retourAddressLeft, null],
            width: retourAddressWidth,
            lineGap: 1,
        });
    });
}

/**
 * @param {import("./document.js").Document} doc
 * @param {Date|number} createdAt
 */
function structLetterHeading(doc, createdAt) {
    return doc._pdf.struct("Sect", function () {
        drawText(doc, {
            text: "Datum",
            font: "LiberationSansRegular",
            size: fontSizeStandard,
            position: [marginLeft, metaTop],
            continued: true,
            lineGap: 1,
        });
        drawText(doc, {
            text: dateString(new Date(createdAt)),
            font: "LiberationSansRegular",
            size: fontSizeStandard,
            position: [marginLeft + 20, null],
            lineGap: 1,
        });
        drawText(doc, {
            text: "Betreft",
            font: "LiberationSansRegular",
            size: fontSizeStandard,
            position: [marginLeft, null],
            continued: true,
            lineGap: 1,
        });
        drawText(doc, {
            text: "Coronabewijzen",
            font: "LiberationSansRegular",
            size: fontSizeStandard,
            position: [marginLeft + 20, null],
            lineGap: 1,
        });
    });
}

/**
 * @param {import("./document.js").Document} doc
 * @param {Object} args
 * @param {import("../postal.js").Address} args.address
 * @param {boolean} args.proofsFound
 * @param {Date|number} args.createdAt
 */
function structLetterBody(doc, args) {
    function paragraph(text, top) {
        drawText(doc, {
            text: text,
            font: "LiberationSansRegular",
            size: fontSizeStandard,
            position: [marginLeft, top || null],
            width: bodyWidth,
            lineGap: 1,
        });
        doc._pdf.moveDown();
    }

    function heading(text) {
        drawText(doc, {
            text: text,
            font: "LiberationSansBold",
            size: fontSizeStandard,
            position: [marginLeft, null],
            width: bodyWidth,
            lineGap: 1,
        });
    }

    return doc._pdf.struct("Sect", function () {
        paragraph(formatSalutation(args.address) + ",", bodyTop);
        if (args.proofsFound) {
            paragraph(
                "Bij deze brief zitten de coronabewijzen die u bij ons heeft aangevraagd."
            );
            paragraph(
                "Bij de brief zit ook een pagina met een lettercombinatie. Daarmee kunt u de papieren bewijzen in de CoronaCheck-app zetten. Bewaar de pagina met de ercombinatie goed, veilig en gescheiden van uw bewijzen."
            );
            paragraph(
                "Heeft u nog maar 1 vaccinatie gekregen met Pfizer of Moderna? Dan bent u vaak nog niet volledig gevaccineerd. U ontvangt dan alleen een coronabewijs dat u in sommige gevallen al kunt gebruiken voor reizen binnen Europa. Op wijsopreis.nl vindt u alle reisadviezen per land die nu gelden. Een corona-toegangsbewijs dat geldig is in Nederland, krijgt u pas als u volledig gevaccineerd bent."
            );
            heading("Kloppen uw gegevens niet?");
            paragraph(
                "Neem dan contact op met de zorgverlener die u geprikt of getest heeft. Dat kan de GGD, uw huisarts of arts van uw zorginstelling zijn. Zij kunnen u helpen uw gegevens te wijzigingen en een bewijs op papier te maken."
            );
            paragraph(
                "Bent u geprikt door de GGD? Dan kunt u hiervoor bellen naar 0800 - 5090. Zij kunnen helpen uw gegevens te wijzigen en uw bewijs opnieuw op te sturen."
            );
        } else {
            paragraph(
                "U heeft ons gebeld om uw coronabewijzen per post op te sturen. We kunnen u echter geen coronabewijzen toesturen."
            );
            paragraph(
                "De reden hiervoor is dat we geen vaccinatiegegevens van u hebben gevonden bij de GGD of het RIVM."
            );
            heading("Heeft u wel een vaccin gehad?");
            paragraph(
                "Het kan zijn dat gegevens niet goed in het registratiesysteem staan. Controleer samen met de zorgverlener die u gevaccineerd heeft of deze gegevens goed in het registratiesysteem staan."
            );
            paragraph(
                "Het gaat om de volgende gegevens:\n   -   BSN\n   -   Naam\n   -   Geboortedatum\n   -   Vaccinatiegegevens (datum, merk en aantal)"
            );
            paragraph(
                "Bent u geprikt door de GGD? Dan kunt u hiervoor bellen naar 0800 - 5090. Zij kunnen helpen uw gegevens te wijzigen en uw bewijs op te sturen."
            );
            heading("Heeft u een paar dagen terug uw vaccin gehad?");
            paragraph(
                "Bel dan over een paar dagen nog een keer. Het duurt een paar dagen voordat de gegevens geregistreerd en verwerkt zijn."
            );
        }
        paragraph(
            "Heeft u nog vragen, dan kunt u bellen met het algemene informatienummer van de Rijksoverheid 0800 – 1351."
        );
    });
}

/**
 * @param {import("./document.js").Document} doc
 */
function structPageNumber(doc) {
    return doc._pdf.struct("Sect", function () {
        drawText(doc, {
            text: "Pagina 1 van 1",
            font: "LiberationSansRegular",
            size: fontSizeSmall,
            position: [pageNumberLeft, pageNumberTop],
        });
    });
}

function dateString(date) {
    return months[date.getMonth()] + " " + date.getFullYear();
}
