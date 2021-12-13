import { base64ToBuffer } from "../util.js";
import { sRGB2014 } from "../assets/metadata.js";

/**
 * @param {import("pdfkit/js/pdfkit.standalone.js")} pdf
 */
export function addOutputIntent(pdf) {
    var colorProfileRef = pdf.ref({ N: 3 });
    colorProfileRef.write(base64ToBuffer(sRGB2014));
    colorProfileRef.end();
    var outputIntentRef = pdf.ref({
        Type: "OutputIntent",
        S: "GTS_PDFA1",
        Info: new String("sRGB2014"),
        OutputConditionIdentifier: new String("sRGB2014"),
        DestOutputProfile: colorProfileRef,
    });
    outputIntentRef.end();
    pdf._root.data.OutputIntents = [outputIntentRef];
}
