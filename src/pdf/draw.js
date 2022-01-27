import {
    flagNl,
    flagEu,
    logoCoronacheck,
    logoRijksoverheidA4,
    logoRijksoverheidA5,
    minvws,
} from "../assets/img.js";
import { qrSvgPath, qrSvgScale } from "../qr.js";
import { parseMarkdownLinks } from "../util.js";

var dpmm = 72 / 25.4; // dots per mm at 72dpi

export function drawFoldInstructions(doc, x, y, width = 30) {
    var scale = width / 30;
    var imageScale = scale * dpmm;
    doc.pdf
        .save()
        .scale(imageScale)
        .translate(x / scale, y / scale)
        .strokeColor("#000000")
        .lineWidth(0.5 / dpmm)
        .path(
            "m29.1 8.25h0.812v-4.27h-3.1m0.0815 4.29 2.21 0.811v-4.25l-2.21-0.811zm0 0 2.21 0.811v-4.25l-2.21-0.811zm-5.59-0.654v0.63m1e-5 -3.13v0.688m0 0.613v0.688m-1e-5 -3.13v0.63m3.02 3.64h-6.04v-4.27h6.04zm-8.53-4.27h-6.04v4.27h6.04zm-6.05 4.33-1.08-3.66h1.09m6.04 3.55h-6.04v-4.27h6.04zm-11.4-4.03h-0.781m-1.18 0h-0.781m-1.17 0h-0.345m5.77 0h-0.345m0.345 4.08h-5.77v-8.17h5.77z"
        )
        .stroke()
        .restore();
}

/**
 * @param {import("./document.js").Document} doc
 * @param {Object} options
 * @param {number} options.x
 * @param {number} options.y
 * @param {number} options.width
 * @param {string} options.image Data URI
 */
export function drawImage(doc, options) {
    doc.pdf.image(options.image, options.x * dpmm, options.y * dpmm, {
        width: options.width * dpmm,
    });
}

export function drawLogoRijksoverheidA4(doc, x, y) {
    doc.pdf.image(logoRijksoverheidA4, (x - 6.5) * dpmm, y * dpmm, {
        width: 13 * dpmm,
    });
}

export function drawLogoRijksoverheidA5(doc, x, y) {
    // The logo scaled to 70% for A5 as specified by rijkshuisstijl.nl.
    doc.pdf.image(logoRijksoverheidA5, (x - 4.55) * dpmm, y * dpmm, {
        width: 9.1 * dpmm,
    });
}

export function structLogoRijksoverheidA4(doc, x, y, alt) {
    x = (x - 6.5) * dpmm;
    y = y * dpmm;
    var width = 13 * dpmm;
    var figure = doc.pdf.struct("Figure", { alt: alt }, function () {
        doc.pdf.image(logoRijksoverheidA4, x, y, { width: width });
    });
    var bbox = [x, y, x + width, y + 17.2 * dpmm];
    figure.dictionary.data.BBox = bbox;
    figure.dictionary.data.A = doc.pdf.ref({
        O: String("Layout"),
        BBox: bbox,
        Placement: String("Block"),
    });
    figure.dictionary.data.A.end();
    return figure;
}

export function structLogoRijksoverheidA5(doc, x, y, alt) {
    // The logo scaled to 70% for A5 as specified by rijkshuisstijl.nl.
    x = (x - 4.55) * dpmm;
    y = y * dpmm;
    var width = 9.1 * dpmm;
    var figure = doc.pdf.struct("Figure", { alt: alt }, function () {
        doc.pdf.image(logoRijksoverheidA5, x, y, { width: width });
    });
    var bbox = [x, y, x + width, y + 18.2 * dpmm];
    figure.dictionary.data.BBox = bbox;
    figure.dictionary.data.A = doc.pdf.ref({
        O: String("Layout"),
        BBox: bbox,
        Placement: String("Block"),
    });
    return figure;
}

export function drawLogoMinVwsA4(doc, x, y) {
    doc.pdf.image(logoRijksoverheidA4, (x - 6.5) * dpmm, y * dpmm, {
        width: 13 * dpmm,
    });
    doc.pdf.image(minvws, (x + 10.565) * dpmm, (y + 26.384) * dpmm, {
        width: 59.142 * dpmm,
    });
}

export function drawFlagNL(doc, x, y, width = 70) {
    doc.pdf.image(flagNl, x * dpmm, y * dpmm, { width: width * dpmm });
}

export function drawFlagEU(doc, x, y, width = 70) {
    doc.pdf.image(flagEu, x * dpmm, y * dpmm, { width: width * dpmm });
}

export function drawLogoCoronaCheck(doc, x, y, width = 9) {
    doc.pdf.image(logoCoronacheck, x * dpmm, y * dpmm, {
        width: width * dpmm,
    });
}

export function drawLineArtifact(doc, line) {
    var x1 = line.x1 * dpmm;
    var y1 = line.y1 * dpmm;
    var x2 = line.x2 * dpmm;
    var y2 = line.y2 * dpmm;
    var lineWidth = line.width || 2 / 3;
    doc.pdf.markContent("Artifact", { type: "Layout" });
    doc.pdf
        .lineWidth(lineWidth)
        .strokeColor(line.color)
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .stroke();
    doc.pdf.endMarkedContent();
}

export function drawBackgroundArtifact(
    doc,
    x,
    y,
    width,
    height,
    cornerRadius = 4,
    color = "#f0f7fa"
) {
    cornerRadius = cornerRadius * dpmm;
    doc.pdf.markContent("Artifact", { type: "Layout" });
    doc.pdf
        .fillColor(color)
        .roundedRect(
            x * dpmm,
            y * dpmm,
            width * dpmm,
            height * dpmm,
            cornerRadius,
            cornerRadius
        )
        .fill();
    doc.pdf.endMarkedContent();
}

export function drawText(doc, textItem) {
    doc.pdf.font(textItem.font);
    doc.pdf.fontSize(textItem.size);
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
            ? [textItem.text]
            : parseMarkdownLinks(textItem.text);
    parts.forEach(function (part, i) {
        var text = typeof part === "string" ? part : part.text;
        var link = typeof part === "string" ? null : part.url;
        var continued = i === parts.length - 1 ? textItem.continued : true;
        // nonsole.error(`hmm "${text}"`);
        function render() {
            doc.pdf.fillColor(link ? linkColor : color);
            doc.pdf.text(text, x, y, {
                align: textItem.align || "left",
                baseline: textItem.baseline,
                width: width,
                lineGap: lineGap,
                continued: continued,
                indent: textItem.indent,
                link: link,
            });
        }
        if (link) {
            doc.pdf.addStructure(doc.pdf.struct("Link", render));
        } else {
            render();
        }
    });
}

export function drawQrSvg(doc, svg, x, y) {
    var path = qrSvgPath(svg);
    var scale = qrSvgScale(svg);
    if (!path) throw new Error("QR parse error");
    doc.pdf
        .save()
        .scale(dpmm / scale)
        .translate(x * scale, y * scale)
        .lineWidth(1)
        .strokeColor("#000000")
        .path(path)
        .stroke()
        .restore();
}
