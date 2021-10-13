var NUM = /^\d+$/;

/** @type {DOMParser | undefined} */
var domParser; // lazily instantiated to support running in jsdom

/**
 * @param {string} input
 * @param {number} length
 * @param {string} pad
 * @return {string}
 */
export function padLeft(input, length, pad) {
    return input.length < length
        ? new Array(length - input.length + 1).join(pad) + input
        : input;
}

/**
 * @param {string} input
 * @return {boolean}
 */
export function isNumeric(input) {
    return NUM.test(input);
}

/**
 * @param {string} input
 * @return {HTMLDocument}
 */
export function parseHTML(input) {
    if (!domParser) domParser = new DOMParser();
    return domParser.parseFromString(input, "text/html");
}

/**
 * @param {string} input
 * @return {XMLDocument}
 */
export function parseSVG(input) {
    if (!domParser) domParser = new DOMParser();
    return domParser.parseFromString(input, "image/svg+xml");
}
