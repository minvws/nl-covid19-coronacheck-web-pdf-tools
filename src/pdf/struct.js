import { parseMarkdownLinks } from "../util.js";

var dpmm = 72 / 25.4; // dots per mm at 72dpi

/**
 * @param {import("./document").Document} doc
 * @param {Object} options
 * @param {string} options.alt
 * @param {number} options.x
 * @param {number} options.y
 * @param {number} options.width
 * @param {number} options.height
 * @param {() => void} fn
 */
export function structFigure(doc, options, fn) {
    var x = options.x * dpmm;
    var y = options.y * dpmm;
    var width = options.width * dpmm;
    var height = options.width * dpmm;
    var bbox = [x, y, x + width, y + height];
    var figure = doc.pdf.struct("Figure", { alt: options.alt }, fn);
    figure.dictionary.data.BBox = bbox;
    figure.dictionary.data.A = doc.pdf.ref({
        O: String("Layout"),
        BBox: bbox,
        Placement: String("Block"),
    });
    figure.dictionary.data.A.end();
    return figure;
}

/**
 * @param {import("./document").Document} doc
 * @param {string} type
 * @param {any} textItem TODO
 */
export function structText(doc, type, textItem) {
    var structOptions = {};
    if (textItem.lang) structOptions.lang = textItem.lang;
    var color = textItem.color || "#000000";
    var linkColor = textItem.linkColor || "#01689b";
    var x =
        (textItem.position && textItem.position[0]) == null
            ? null
            : textItem.position[0] * dpmm;
    var y =
        (textItem.position && textItem.position[1]) == null
            ? null
            : textItem.position[1] * dpmm;
    var width = textItem.width && textItem.width * dpmm;
    var lineGap = textItem.lineGap && textItem.lineGap * dpmm;
    var parts =
        textItem.parseLinks === false
            ? [textItem.text || ""]
            : parseMarkdownLinks(textItem.text || "");
    var after;
    if (textItem.emptyLineAfter) {
        after = function (i) {
            if (i === parts.length - 1) {
                doc.pdf.moveDown();
            }
        };
    }
    return doc.pdf.struct(
        type,
        structOptions,
        parts.map(function (part, i) {
            var text = typeof part === "string" ? part : part.text;
            var link = typeof part === "string" ? null : part.url;
            var continued = i === parts.length - 1 ? textItem.continued : true;
            var textOptions = {
                align: textItem.align || "left",
                baseline: textItem.baseline,
                width: width,
                lineGap: lineGap,
                continued: continued,
                indent: textItem.indent,
                link: link,
                underline: !!link,
            };

            if (!link) {
                return doc.pdf.struct("Span", function () {
                    doc.pdf.font(textItem.font);
                    doc.pdf.fontSize(textItem.size);
                    doc.pdf.fillColor(color);
                    doc.pdf.text(text, x, y, textOptions);
                    after && after(i);
                });
            }

            return doc.pdf.struct("Link", function () {
                doc.pdf.font(textItem.font);
                doc.pdf.fontSize(textItem.size);
                doc.pdf.fillColor(link ? linkColor : color);
                doc.pdf.text(text, x, y, textOptions);
                after && after(i);
            });
        })
    );
}

/**
 * @param {import("./document").Document} doc
 * @param {any} list TODO
 * @return {any} PDFStructureElement
 */
export function structList(doc, list) {
    var x = list.position[0] * dpmm;
    var width = list.width && list.width * dpmm;
    var lineGap = list.lineGap && list.lineGap * dpmm;
    var indent = list.indent || list.size / 2;
    var textX = (list.position[0] + (list.indent || list.size / 2)) * dpmm;
    var textWidth = width && width - indent;
    var startY = list.position[1] == null ? null : list.position[1] * dpmm;
    var y;
    return doc.pdf.struct(
        "L",
        list.items.map(function (text, i) {
            return doc.pdf.struct("LI", [
                doc.pdf.struct("Lbl", function () {
                    doc.pdf.font(list.font);
                    doc.pdf.fillColor(list.color || "#000000");
                    doc.pdf.fontSize(list.size);
                    var label = list.label || i + 1 + ".";
                    doc.pdf.text(label, x, startY, {
                        align: list.align || "left",
                        baseline: list.baseline,
                        width: width,
                        lineGap: lineGap,
                    });
                    startY = null;
                    y = doc.pdf.y - doc.pdf.currentLineHeight() - lineGap;
                }),
                doc.pdf.struct("LBody", function () {
                    doc.pdf.font(list.font);
                    doc.pdf.fillColor(list.color || "#000000");
                    doc.pdf.fontSize(list.size);
                    doc.pdf.text(text, textX, y, {
                        align: list.align || "left",
                        baseline: list.baseline,
                        width: textWidth,
                        lineGap: lineGap,
                    });
                    if (list.emptyLineBetweenItems) {
                        doc.pdf.moveDown();
                    }
                }),
            ]);
        })
    );
}

/**
 * @param {import("./document").Document} doc
 * @param {any} options TODO
 * @return {any} PDFStructureElement
 */
export function structDynamicList(doc, options) {
    var drawLabel =
        options.drawLabel ||
        function (n, x, y) {
            doc.pdf.font(options.font);
            doc.pdf.fillColor(options.color || "#000000");
            doc.pdf.fontSize(options.size);
            doc.pdf.text(n + ".", x, y);
        };

    var x = options.position && options.position[0];
    var startY = options.position && options.position[1];
    x = x != null ? x * dpmm : doc.pdf.x;
    startY = startY != null ? startY * dpmm : doc.pdf.y;
    var indent = (options.indent || 5) * dpmm;
    var width = options.width * dpmm - indent;
    var y;

    return doc.pdf.struct(
        "L",
        options.items.map(function (drawBody, i) {
            return doc.pdf.struct("LI", [
                doc.pdf.struct("Lbl", function () {
                    drawLabel(i + 1, x, startY);
                    startY = null;
                    y = doc.pdf.y - doc.pdf.currentLineHeight();
                }),
                doc.pdf.struct("LBody", function () {
                    drawBody(x + indent, y, width);
                    doc.pdf.font(options.font);
                    doc.pdf.fillColor(options.color || "#000000");
                    doc.pdf.fontSize(options.size);
                    doc.pdf.moveDown(
                        typeof options.itemGap === "undefined"
                            ? 1
                            : options.itemGap
                    );
                }),
            ]);
        })
    );
}
