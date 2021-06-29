import "core-js/features/promise";
import { jsPDF } from "jspdf";

import {
  DejaVuSans,
  DejaVuSansBold,
  MontserratRegular,
  MontserratBold,
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
/** @typedef {import("./types").Page} Page */

/**
 * @param {Metadata} metadata
 * @param {Locale} locale
 * @return {jsPDF}
 */
const initDoc = (metadata, locale) => {
  const doc = new jsPDF({ format: "a4", orientation: "portrait" });

  doc.addFileToVFS("Montserrat-Regular.ttf", MontserratRegular);
  doc.addFileToVFS("Montserrat-Bold.ttf", MontserratBold);
  doc.addFont("Montserrat-Regular.ttf", "montserrat", "normal");
  doc.addFont("Montserrat-Bold.ttf", "montserrat", "bold");

  doc.addFileToVFS("DejaVuSans.ttf", DejaVuSans);
  doc.addFileToVFS("DejaVuSansBold.ttf", DejaVuSansBold);
  doc.addFont("DejaVuSans.ttf", "dejavu-sans", "normal");
  doc.addFont("DejaVuSansBold.ttf", "dejavu-sans", "bold");

  doc.setFont("dejavu-sans");

  doc.setProperties(metadata);
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
      textItem.textAlign && textItem.width
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
      doc.text(textItem.text, x, textItem.position[1], textAlign);
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
 * @param {Page[]} pages
 * @param {"en"|"nl"} locale
 * @param {Metadata} metadata
 * @param {number} qrSizeInCm
 * @return {Promise<jsPDF>}
 */
export const getDocument = async (pages, locale, metadata, qrSizeInCm) => {
  const doc = initDoc(metadata, locale);
  for (const page of pages) {
    if (pages.indexOf(page) > 0) {
      doc.addPage();
    }
    const frames = getFrames();
    const textItems = getTextItems(page, locale);
    const lines = getLines();
    const imageItems = await getImageItems(page, qrSizeInCm);
    drawFrames(doc, frames);
    drawImageItems(doc, imageItems);
    drawLines(doc, lines);
    drawTextItems(doc, textItems);
  }
  return doc;
};
