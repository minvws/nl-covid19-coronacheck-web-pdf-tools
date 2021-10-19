import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import blobStream from "blob-stream";
import FileSaver from "file-saver";
import { t } from "../i18n/index.js";
import { blobToDataURI } from "../util.js";
import { addDccCoverPage } from "./dccCoverPage.js";
import { addProofPage } from "./proofPage.js";

/** @typedef {import("../types").Metadata} Metadata */
/** @typedef {import("../types").Locale} Locale */
/** @typedef {import("../types").Proof} Proof */

/**
 * @typedef {Object} Document
 * @property {Locale} locale
 * @property {(name: string, data: string) => void} loadFont
 * @property {PDFDocument} _pdf
 * @property {Promise<void>} _pageQueue
 * @property {boolean} _finalized
 * @property {(fn: () => void|Promise<unknown>) => void} _addPage
 */

/**
 * @typedef {Object} LegacyDocument
 * @property {(type: 'datauristring') => string} output
 * @property {(filename: string) => void} save
 * @property {Blob} blob
 */

/**
 * @param {Locale} locale
 * @param {Metadata} [metadata]
 * @return {Document}
 */
export function createDocument(locale, metadata) {
    var author = (metadata && metadata.author) || t(locale, "metadata.author");
    var title = (metadata && metadata.title) || t(locale, "metadata.title");

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

    var doc = {
        locale: locale,
        loadFont: loadFont,
        _pdf: pdf,
        _pageQueue: Promise.resolve(),
        _finalized: false,
        _addPage: function (fn) {
            if (doc._finalized) {
                throw new Error("Document finalized, unable to add new page");
            }
            doc._pageQueue = doc._pageQueue.then(fn);
        },
    };

    return doc;
}

/**
 * @param {Object} args
 * @param {Proof[]} args.proofs
 * @param {"en"|"nl"} args.locale
 * @param {number} args.qrSizeInCm
 * @param {Date|number} args.createdAt - Date or timestamp in ms
 * @param {Metadata} [args.metadata]
 * @return {Promise<LegacyDocument>}
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
    return result
        .then(function () {
            return documentToBlob(doc);
        })
        .then(function (blob) {
            return blobToDataURI(blob).then(function (dataURI) {
                return {
                    output: function () {
                        return dataURI;
                    },
                    save: function (filename) {
                        FileSaver.saveAs(blob, filename);
                    },
                    blob: blob,
                };
            });
        });
}

/**
 * NB: using this will finalize the document, making it impossible to add further pages.
 * @param {Document} doc
 * @return {Promise<Blob>}
 */
export function documentToBlob(doc) {
    return doc._pageQueue.then(function () {
        return new Promise(function (resolve, reject) {
            var stream = blobStream();
            doc._pdf.pipe(stream);
            stream.on("finish", function () {
                resolve(stream.toBlob("application/pdf"));
            });
            stream.on("error", function (error) {
                reject(error);
            });
            doc._finalized = true;
            doc._pdf.end();
        });
    });
}

/**
 * NB: using this will finalize the document, making it impossible to add further pages.
 * @param {Document} doc
 * @return {Promise<void>}
 */
export function saveDocument(doc, filename) {
    return documentToBlob(doc).then(function (blob) {
        FileSaver.saveAs(blob, filename);
    });
}
