var NUM = /^\d+$/;
var MARKDOWN_LINKS = /(\[[^[]+?\]\([^(]+?\)\s?)/g;
var MARKDOWN_LINK = /\[([^[]+?)\]\(([^(]+?)\)(\s?)/;

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
 * @param {string} text
 * @return {(string|{text: string, url: string})[]}
 */
export function parseMarkdownLinks(text) {
    return text.split(MARKDOWN_LINKS).reduce(function (result, part) {
        if (!part) return result;
        var matches = part.match(MARKDOWN_LINK);
        result.push(
            matches
                ? { text: matches[1] + (matches[3] || ""), url: matches[2] }
                : part
        );
        return result;
    }, []);
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

/**
 * @param {Blob} blob
 * @return {Promise<string>}
 */
export function blobToDataURI(blob) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.addEventListener("error", function () {
            reject(reader.error);
        });
        reader.addEventListener("load", function () {
            resolve(String(reader.result));
        });
        reader.readAsDataURL(blob);
    });
}

/**
 * @param {string} data
 * @return {Uint8Array}
 */
export function base64ToBuffer(data) {
    data = atob(data);
    var length = data.length;
    var buffer = new Uint8Array(new ArrayBuffer(length));
    for (var i = 0; i < length; i++) buffer[i] = data.charCodeAt(i);
    return buffer;
}
