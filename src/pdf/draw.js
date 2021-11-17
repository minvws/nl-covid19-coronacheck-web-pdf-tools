import {
    flagNl,
    flagEu,
    logoCoronacheck,
    logoRijksoverheidA4,
    logoRijksoverheidA5,
    minvws,
} from "../assets/img.js";
import { qrSvgPath, qrSvgScale } from "../qr.js";

var dpmm = 72 / 25.4; // dots per mm at 72dpi

export function drawFoldInstructions(doc, x, y, width = 30) {
    var scale = width / 30;
    var imageScale = scale * dpmm;
    doc._pdf
        .save()
        .scale(imageScale)
        .translate(x / scale, y / scale)
        .path(
            "m29.1 8.25h0.812v-4.27h-3.1m0.0815 4.29 2.21 0.811v-4.25l-2.21-0.811zm0 0 2.21 0.811v-4.25l-2.21-0.811zm-5.59-0.654v0.63m1e-5 -3.13v0.688m0 0.613v0.688m-1e-5 -3.13v0.63m3.02 3.64h-6.04v-4.27h6.04zm-8.53-4.27h-6.04v4.27h6.04zm-6.05 4.33-1.08-3.66h1.09m6.04 3.55h-6.04v-4.27h6.04zm-11.4-4.03h-0.781m-1.18 0h-0.781m-1.17 0h-0.345m5.77 0h-0.345m0.345 4.08h-5.77v-8.17h5.77z"
        )
        .lineWidth(0.5 / dpmm)
        .stroke([0, 0, 0])
        .restore();
}

export function drawLogoRijksoverheidA4(doc, x, y) {
    doc._pdf.image(logoRijksoverheidA4, (x - 6.5) * dpmm, y * dpmm, {
        width: 13 * dpmm,
    });
}

export function drawLogoRijksoverheidA5(doc, x, y) {
    // The logo is 9.1mm wide: 13mm scaled to 70% for A5 as specified by
    // rijkshuisstijl.nl.
    doc._pdf.image(logoRijksoverheidA5, (x - 4.55) * dpmm, y * dpmm, {
        width: 9.1 * dpmm,
    });
}

export function drawLogoMinVwsA4(doc, x, y) {
    doc._pdf.image(logoRijksoverheidA4, (x - 6.5) * dpmm, y * dpmm, {
        width: 13 * dpmm,
    });
    doc._pdf.image(minvws, (x + 10.565) * dpmm, (y + 26.384) * dpmm, {
        width: 59.142 * dpmm,
    });
}

export function drawFlagNL(doc, x, y, width = 70) {
    doc._pdf.image(flagNl, x * dpmm, y * dpmm, { width: width * dpmm });
}

export function drawFlagEU(doc, x, y, width = 70) {
    doc._pdf.image(flagEu, x * dpmm, y * dpmm, { width: width * dpmm });
}

export function drawLogoCoronaCheck(doc, x, y, width = 9) {
    doc._pdf.image(logoCoronacheck, x * dpmm, y * dpmm, {
        width: width * dpmm,
    });
}

export function drawLine(doc, line, margin = 10) {
    var x1 = line.x1 * dpmm;
    var y1 = line.y1 * dpmm;
    var x2 = line.x2 * dpmm;
    var y2 = line.y2 * dpmm;
    var lineWidth = line.width || 2 / 3;
    margin = margin * dpmm;

    doc._pdf.markContent("Artifact", {
        type: "Layout",
        bbox: [x1 - margin, y2 - margin, x2 - x1 + margin, y2 - y1 + margin],
    });
    doc._pdf
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .lineWidth(lineWidth)
        .stroke(line.color);
    doc._pdf.endMarkedContent();
}

export function drawInfoFrame(doc, x, y, width, height, cornerRadius = 4) {
    cornerRadius = cornerRadius * dpmm;
    doc._pdf
        .roundedRect(
            x * dpmm,
            y * dpmm,
            width * dpmm,
            height * dpmm,
            cornerRadius,
            cornerRadius
        )
        .fill("#f0f7fa");
}

export function drawText(doc, textItem) {
    doc._pdf.font(textItem.font);
    doc._pdf.fillColor(textItem.color || "#000000");
    doc._pdf.fontSize(textItem.size);
    doc._pdf.text(
        textItem.text,
        (textItem.position && textItem.position[0]) == null
            ? null
            : textItem.position[0] * dpmm,
        (textItem.position && textItem.position[1]) == null
            ? null
            : textItem.position[1] * dpmm,
        {
            align: textItem.align || "left",
            baseline: textItem.baseline,
            width: textItem.width && textItem.width * dpmm,
            lineGap: textItem.lineGap && textItem.lineGap * dpmm,
            continued: textItem.continued,
            indent: textItem.indent,
        }
    );
}

export function drawList(doc, list) {
    var x = list.position[0] * dpmm;
    var width = list.width && list.width * dpmm;
    var lineGap = list.lineGap && list.lineGap * dpmm;
    var indent = list.indent || list.size / 2;
    var textX = (list.position[0] + (list.indent || list.size / 2)) * dpmm;
    var textWidth = width && width - indent;
    var startY = list.position[1] * dpmm;
    var y;
    return doc._pdf.struct(
        "L",
        list.items.map(function (text, i) {
            return doc._pdf.struct("LI", [
                doc._pdf.struct("Lbl", function () {
                    doc._pdf.font(list.font);
                    doc._pdf.fillColor(list.color || "#000000");
                    doc._pdf.fontSize(list.size);
                    doc._pdf.text(i + 1 + ".", x, startY, {
                        align: list.align || "left",
                        baseline: list.baseline,
                        width: width,
                        lineGap: lineGap,
                    });
                    startY = null;
                    y = doc._pdf.y - doc._pdf.currentLineHeight() - lineGap;
                }),
                doc._pdf.struct("LBody", function () {
                    doc._pdf.font(list.font);
                    doc._pdf.fillColor(list.color || "#000000");
                    doc._pdf.fontSize(list.size);
                    doc._pdf.text(text, textX, y, {
                        align: list.align || "left",
                        baseline: list.baseline,
                        width: textWidth,
                        lineGap: lineGap,
                    });
                    doc._pdf.moveDown();
                }),
            ]);
        })
    );
}

export function drawDynamicList(doc, options) {
    var drawLabel =
        options.drawLabel ||
        function (n, x, y) {
            doc._pdf.font(options.font);
            doc._pdf.fillColor(options.color || "#000000");
            doc._pdf.fontSize(options.size);
            doc._pdf.text(n + ".", x, y);
        };

    var x = options.position && options.position[0];
    var startY = options.position && options.position[1];
    x = x != null ? x * dpmm : doc._pdf.x;
    startY = startY != null ? startY * dpmm : doc._pdf.y;
    var indent = (options.indent || 5) * dpmm;
    var width = options.width * dpmm - indent;
    var y;

    return doc._pdf.struct(
        "L",
        options.items.map(function (drawBody, i) {
            return doc._pdf.struct("LI", [
                doc._pdf.struct("Lbl", function () {
                    drawLabel(i + 1, x, startY);
                    startY = null;
                    y = doc._pdf.y - doc._pdf.currentLineHeight();
                }),
                doc._pdf.struct("LBody", function () {
                    drawBody(x + indent, y, width);
                    doc._pdf.font(options.font);
                    doc._pdf.fillColor(options.color || "#000000");
                    doc._pdf.fontSize(options.size);
                    doc._pdf.moveDown(options.itemGap || 1);
                }),
            ]);
        })
    );
}

export function drawQrSvg(doc, svg, x, y) {
    var path = qrSvgPath(svg);
    var scale = qrSvgScale(svg);
    if (!path) throw new Error("QR parse error");
    doc._pdf
        .save()
        .scale(dpmm / scale)
        .translate(x * scale, y * scale)
        .path(path)
        .lineWidth(1)
        .stroke([0, 0, 0])
        .restore();
}
