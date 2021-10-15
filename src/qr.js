import qrcode from "qrcode";
import { parseSVG } from "./util.js";

var cmToInch = 10 / 25.4;
var dpi = 300;

/**
 * @param {string} qrCode
 * @param {number} sizeInCm
 * @param {string} territory
 * @return {Promise<string>} PNG data URL string
 */
export function generateQR(qrCode, sizeInCm, territory) {
    var sizeInPixels = Math.round(sizeInCm * cmToInch * dpi);
    var qrOptions = {
        width: sizeInPixels,
        margin: 0,
        errorCorrectionLevel: territory === "nl" ? "L" : "Q",
    };
    return qrcode.toDataURL(qrCode, qrOptions);
}

/**
 * @param {string} qrCode
 * @param {number} size
 * @param {string}  territory
 * @return {Promise<XMLDocument>} Parsed SVG XMLDocument
 */
export function qrDataToSvg(qrCode, size, territory) {
    var qrOptions = {
        type: "svg",
        width: size,
        margin: 0,
        errorCorrectionLevel: territory === "nl" ? "L" : "Q",
    };
    return qrcode.toString(qrCode, qrOptions).then(parseSVG);
}

/**
 * @param {XMLDocument} svg
 * @return {string | undefined}
 */
export function qrSvgPath(svg) {
    var paths = svg.querySelectorAll("path");
    var path = paths && paths[1];
    if (path && path.getAttribute) return path.getAttribute("d");
}

/**
 * @param {XMLDocument} svg
 * @return {number}
 */
export function qrSvgScale(svg) {
    var width = svg.documentElement.getAttribute("width");
    var size = svg.documentElement.getAttribute("viewBox").split(" ")[2];
    return parseFloat(size) / parseFloat(width);
}
