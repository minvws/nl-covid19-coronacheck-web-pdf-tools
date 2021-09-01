import { parseHTML } from "./util.js";

export var regular = ["liberation-sans", "normal", 400];
export var bold = ["liberation-sans", "normal", 700];

export function setFontAndWeight(doc, textItem, chunk) {
    const family = textItem.fontFamily;
    const weight = chunk
        ? chunk.fontWeight
            ? chunk.fontWeight
            : 400
        : textItem.fontWeight
        ? textItem.fontWeight
        : 400;
    const style = chunk
        ? chunk.fontStyle
            ? chunk.fontStyle
            : "normal"
        : textItem.fontStyle
        ? textItem.fontStyle
        : "normal";
    const properties = [family, style, weight];
    doc.setFont(...properties);
}

const hasSpaces = (text) => {
    return text.indexOf(" ") > -1;
};

const doesTextFit = (doc, text, availableWidth) => {
    const textWidth = doc.getTextWidth(text);
    return textWidth <= availableWidth;
};

export function htmlToChunks(text) {
    const chunks = [];
    // parse the html string
    const html = parseHTML(text);
    // find the children on the body node, these are the chunks
    const nodes = html.querySelector("body").childNodes;
    // @ts-ignore NodeList, TODO: refactor to plain for
    for (const node of nodes) {
        if (node.nodeType === 3) {
            chunks.push({
                text: node.nodeValue.trim(),
            });
        } else if (node.nodeType === 1) {
            // we assume no deeper nesting, the text is direct on the first (and only) childNode
            switch (/** @type {Element} */ node.tagName.toLowerCase()) {
                case "b":
                    chunks.push({
                        text: node.childNodes[0].nodeValue.trim(),
                        fontWeight: 700,
                    });
                    break;
                case "a":
                    chunks.push({
                        text: node.childNodes[0].nodeValue.trim(),
                        color: [71, 142, 255],
                    });
                    break;
                case "br":
                    chunks.push({
                        break: true,
                    });
                    break;
            }
        }
    }
    return chunks;
}
