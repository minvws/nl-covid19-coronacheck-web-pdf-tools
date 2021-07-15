import "core-js/features/promise";
import { jsPDF } from "jspdf";
import { t } from "./i18n";

import {
    MontserratRegular,
    MontserratBold,
    RobotoRegular,
    RobotoBold,
    RobotoItalic,
} from "./assets/fonts";
import { getTextItems, getImageItems, getFrames, getLines } from "./content";
import {
    drawTextItemOverLines,
    drawTextItemWithMixedChunks,
    htmlToChunks,
    setFontAndWeight,
} from "./text-helpers";

/** @typedef {import("./types").Metadata} Metadata */
/** @typedef {import("./types").Locale} Locale */
/** @typedef {import("./types").Proof} Proof */

/**
 * @param {Locale} locale
 * @param {Metadata} [metadata]
 * @return {jsPDF}
 */
const initDoc = (locale, metadata) => {
    const doc = new jsPDF({ format: "a4", orientation: "portrait" });

    doc.addFileToVFS("Montserrat-Regular.ttf", MontserratRegular);
    doc.addFileToVFS("Montserrat-Bold.ttf", MontserratBold);
    doc.addFont("Montserrat-Regular.ttf", "montserrat", "normal", 400);
    doc.addFont("Montserrat-Bold.ttf", "montserrat", "normal", 700);

    doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
    doc.addFileToVFS("Roboto-Bold.ttf", RobotoBold);
    doc.addFileToVFS("Roboto-Italic.ttf", RobotoItalic);
    doc.addFont("Roboto-Regular.ttf", "roboto", "normal", 400);
    doc.addFont("Roboto-Bold.ttf", "roboto", "normal", 700);
    doc.addFont("Roboto-Italic.ttf", "roboto", "italic", 400);

    doc.setFont("roboto");

    doc.setProperties(
        metadata || {
            author: t(locale, "metadata.author"),
            title: t(locale, "metadata.title"),
        }
    );
    doc.setLanguage(locale);
    doc.viewerPreferences({
        DisplayDocTitle: true,
    });
    return doc;
};

const drawImageItems = (doc, imageItems) => {
    for (const imageItem of imageItems) {
        doc.addImage(
            imageItem.url,
            "PNG",
            imageItem.x,
            imageItem.y,
            imageItem.width,
            imageItem.height,
            null,
            "SLOW"
        );
    }
};

/**
 * @param {jsPDF} doc
 * @param {import("./content").Line[]} lines
 */
const drawLines = (doc, lines) => {
    for (const line of lines) {
        doc.setDrawColor.apply(doc, line.color);
        doc.line(line.x1, line.y1, line.x2, line.y2);
    }
};

/**
 * @param {jsPDF} doc
 * @param {import("./content").TextItem[]} textItems
 */
const drawTextItems = (doc, textItems) => {
    for (const textItem of textItems) {
        if (textItem.color) {
            doc.setTextColor.apply(doc, textItem.color);
        } else {
            doc.setTextColor(0, 0, 0);
        }
        const textAlign = textItem.textAlign ? textItem.textAlign : "left";
        // for center align jspdf needs to now the center x
        const x =
            textItem.textAlign &&
            textItem.textAlign === "center" &&
            textItem.width
                ? textItem.position[0] + 0.5 * textItem.width
                : textItem.position[0];
        if (textItem.fontSize) {
            doc.setFontSize(textItem.fontSize);
        }
        if (textItem.color) {
            doc.setTextColor.apply(doc, textItem.color);
        } else {
            doc.setTextColor(0, 0, 0);
        }
        setFontAndWeight(doc, textItem, null);

        if (textItem.width) {
            if (textItem.hasHTML) {
                const text = htmlToChunks(textItem.text);
                drawTextItemWithMixedChunks(
                    doc,
                    text,
                    textItem,
                    x,
                    textItem.position[1]
                );
            } else {
                drawTextItemOverLines(doc, textItem, x, textAlign);
            }
        } else {
            // @ts-ignore
            doc.text(textItem.text, x, textItem.position[1], {
                align: textAlign,
            });
        }
    }
};

/**
 * @param {jsPDF} doc
 * @param {import("./content").Frame[]} frames
 */
const drawFrames = (doc, frames) => {
    for (const frame of frames) {
        doc.setFillColor.apply(doc, frame.color);
        doc.roundedRect(
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            frame.rx,
            frame.ry,
            "F"
        );
    }
};

/**
 * @param {Object} args
 * @param {Proof[]} args.proofs
 * @param {"en"|"nl"} args.locale
 * @param {number} args.qrSizeInCm
 * @param {Date|number} args.createdAt - Date or timestamp in ms
 * @param {Metadata} [args.metadata]
 * @return {Promise<jsPDF>}
 */
export const getDocument = async (args) => {
    if (args.createdAt instanceof Date && isNaN(args.createdAt.getTime())) {
        throw new Error("Invalid createdAt");
    }
    const doc = initDoc(args.locale, args.metadata);
    for (const proof of args.proofs) {
        if (args.proofs.indexOf(proof) > 0) {
            doc.addPage();
        }
        const frames = getFrames(proof.territory);
        const textItems = getTextItems(proof, args.locale, args.createdAt);
        const lines = getLines();
        const imageItems = await getImageItems(proof, args.qrSizeInCm);
        drawFrames(doc, frames);
        drawImageItems(doc, imageItems);
        drawLines(doc, lines);
        drawTextItems(doc, textItems);
    }
    return doc;
};
