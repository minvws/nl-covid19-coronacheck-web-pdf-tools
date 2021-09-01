import PDFDocument from "pdfkit";
import { t } from "../i18n/index.js";
import { addDccCoverPage } from "./dccCoverPage.js";
import { addProofPage } from "./proofPage.js";
import { atob } from "../util.js";

/** @typedef {import("../types").Metadata} Metadata */
/** @typedef {import("../types").Locale} Locale */
/** @typedef {import("../types").Proof} Proof */

/**
 * @typedef {Object} Document
 * @property {Locale} locale
 * @property {(string) => void} loadFont
 * @property {PDFDocument} _pdf
 */

/**
 * @param {Locale} locale
 * @param {Metadata} [metadata]
 * @return {Document}
 */
export function createDocument(locale, metadata) {
    var author =
        (metadata && metadata.author) ||
        "TESTauthor" ||
        t(locale, "metadata.author");
    var title =
        (metadata && metadata.title) ||
        "TESTdocument" ||
        t(locale, "metadata.title");

    var pdf = new PDFDocument({
        autoFirstPage: false,
        displayTitle: true,
        info: {
            Author: author,
            Title: title,
            Producer: "CoronaCheck",
            Creator: "Rijksoverheid",
        },
        lang: locale,
        margin: 0,
        pdfVersion: "1.5",
        size: "A4",
        tagged: true,
    });

    var loadedFonts = [];
    function loadFont(name, data) {
        if (loadedFonts.indexOf(name) !== -1) {
            return;
        }
        data = atob(data);
        var length = data.length;
        var buffer = new Uint8Array(new ArrayBuffer(length));
        for (var i = 0; i < length; i++) buffer[i] = data.charCodeAt(i);
        pdf.registerFont(name, buffer);
        loadedFonts.push(name);
    }

    return {
        locale: locale,
        loadFont: loadFont,
        _pdf: pdf,
    };
}

/**
 * @param {Object} args
 * @param {Proof[]} args.proofs
 * @param {"en"|"nl"} args.locale
 * @param {number} args.qrSizeInCm
 * @param {Date|number} args.createdAt - Date or timestamp in ms
 * @param {Metadata} [args.metadata]
 * @return {Promise<Document>}
 */
export function getDocument(args) {
    if (args.createdAt instanceof Date && isNaN(args.createdAt.getTime())) {
        throw new Error("Invalid createdAt");
    }
    var doc = createDocument(args.locale, args.metadata);
    var result = new Promise(function (resolve) {
        resolve();
    });
    addDccCoverPage(doc, args.proofs, args.createdAt);
    args.proofs.forEach(function (proof) {
        result = result.then(function () {
            return addProofPage(doc, proof, args.createdAt);
        });
    });
    return result.then(function () {
        return doc;
    });
}

export function toDataURI(doc) {}
