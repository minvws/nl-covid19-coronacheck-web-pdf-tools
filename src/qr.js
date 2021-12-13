import qrcode from "qrcode";
import { parseSVG } from "./util.js";

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
 * @return {number} QR scale (i.e. ratio between SVG's width attribute and viewBox width)
 */
export function qrSvgScale(svg) {
    var width = svg.documentElement.getAttribute("width");
    var size = svg.documentElement.getAttribute("viewBox").split(" ")[2];
    return parseFloat(size) / parseFloat(width);
}

/**
 * @param {XMLDocument} svg
 * @return {number} QR size in milimeters (i.e. the SVG's width attribute)
 */
export function qrSvgSize(svg) {
    return parseFloat(svg.documentElement.getAttribute("width"));
}
