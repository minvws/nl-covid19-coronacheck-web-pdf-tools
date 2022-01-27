import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import blobStream from "blob-stream";
import FileSaver from "file-saver";
import { t } from "../i18n/index.js";
import { base64ToBuffer, blobToDataURI } from "../util.js";
import { addDccCoverPage } from "./dccCoverPage.js";
import { addProofPage } from "./proofPage.js";
import { addXmp } from "./xmp.js";

/**
 * @typedef {Object} Document
 * @property {import("../types").Locale} locale
 * @property {(name: string, data: string) => void} loadFont
 * @property {(fn: () => void|Promise<void>, sides?: number) => void} addPart
 * @property {(type: string, contents: (() => void) | any[]) => void} addStruct
 * @property {(destination: WritableStream) => WritableStream} pipe
 * @property {PDFDocument} pdf Internal pdfkit PDFDocument instance
 */

/**
 * @typedef {Object} LegacyDocument
 * @property {(type: 'datauristring') => string} output
 * @property {(filename: string) => void} save
 * @property {Blob} blob
 */

/**
 * @param {import("../types").Locale} locale
 * @param {Object} [args]
 * @param {Date|number} [args.createdAt]
 * @param {string} [args.title] Title of the document, e.g. "Coronabewijs"
 * @param {string} [args.author] Author of the document, e.g. "Rijksoverheid"
 * @param {string} [args.creator] Tool that created the document, e.g. "CoronaCheck"
 * @param {boolean} [args.doubleSided] Add an empty page between parts where necessary
 * @param {boolean} [args.printMode] Optimize for low memory usage at the cost of reduce accessibility.
 * @return {Document}
 */
export function createDocument(locale, args) {
    var title = (args && args.title) || t(locale, "metadata.title");
    var author = (args && args.author) || t(locale, "metadata.author");
    var creator = (args && args.creator) || "CoronaCheck";
    var createdAt =
        (args && args.createdAt && new Date(args.createdAt)) || new Date();

    var pdf = new PDFDocument({
        autoFirstPage: false,
        displayTitle: true,
        pdfVersion: "1.7",
        tagged: true,
        info: {
            Title: title,
            Author: author,
            Creator: creator,
            Producer: creator,
        },
        lang: locale,
        size: "A4",
        margin: 0,
    });

    addXmp(pdf, {
        title: title,
        author: author,
        creator: creator,
        createdAt: createdAt,
    });

    var loadedFonts = [];
    function loadFont(name, data) {
        if (loadedFonts.indexOf(name) !== -1) return;
        pdf.registerFont(name, base64ToBuffer(data));
        loadedFonts.push(name);
    }

    var documentStruct;
    if (!args.printMode) {
        documentStruct = pdf.struct("Document");
        pdf.addStructure(documentStruct);
    }

    function addPage() {
        pdf.addPage();
        pdf.page.dictionary.data.Tabs = "S";
    }

    function addPart(fn, sides) {
        if (finalized) {
            throw new Error("Cannot _addPart, document already finalized");
        }
        pageQueue = pageQueue.then(addPage).then(fn);
        if (args && args.doubleSided && (sides == null || sides % 2)) {
            pageQueue = pageQueue.then(addPage);
        }
    }

    function addStruct(type, contents) {
        if (finalized) {
            throw new Error("Cannot addStruct, document already finalized");
        }
        if (args.printMode) {
            pdf.addStructure(pdf.struct(type, contents));
        } else {
            documentStruct.add(pdf.struct(type, contents));
        }
    }

    function pipe(destination) {
        if (finalized) {
            throw new Error("Cannot pipe(), document already finalized.");
        }
        pdf.pipe(destination);
        pageQueue
            .then(function () {
                finalized = true;
                documentStruct && documentStruct.end();
                pdf.end();
            })
            .catch(function (error) {
                console.error("Error adding page(s)", error);
            });
        return destination;
    }

    var pageQueue = Promise.resolve();
    var finalized = false;
    var doc = {
        locale: locale,
        loadFont: loadFont,
        addPart: addPart,
        addStruct: addStruct,
        pipe: pipe,
        pdf: pdf,
    };

    return doc;
}

/**
 * @param {Object} args
 * @param {import("../types").Proof[]} args.proofs
 * @param {"en"|"nl"} args.locale
 * @param {Date|number} args.createdAt - Date or timestamp in ms
 * @param {string} [args.title]
 * @param {string} [args.author]
 * @param {number} [args.qrSizeInCm] DEPRECATED
 * @param {Object} [args.metadata] DEPRECATED
 * @param {string} [args.metadata.title] DEPRECATED
 * @param {string} [args.metadata.author] DEPRECATED
 * @param {boolean} [args.nlPrintIssuedOn] DEPRECATED
 * @param {string} [args.nlKeyId] DEPRECATED
 * @return {Promise<LegacyDocument>}
 */
export function getDocument(args) {
    if (args.createdAt instanceof Date && isNaN(args.createdAt.getTime())) {
        throw new Error("Invalid createdAt");
    }
    var doc = createDocument(args.locale, {
        title: args.title || (args.metadata && args.metadata.title),
        author: args.author || (args.metadata && args.metadata.author),
        createdAt: args.createdAt,
    });
    addDccCoverPage(doc, args.proofs, args.createdAt);
    args.proofs.forEach(function (proof) {
        addProofPage(doc, proof, args.createdAt);
    });
    return documentToBlob(doc).then(function (blob) {
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
    return new Promise(function (resolve, reject) {
        var stream = blobStream();
        stream.on("finish", function () {
            resolve(stream.toBlob("application/pdf"));
        });
        stream.on("error", function (error) {
            reject(error);
        });
        doc.pipe(stream);
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
