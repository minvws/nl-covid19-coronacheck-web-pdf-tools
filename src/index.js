export {
    parseDomesticProof,
    parseEuropeanProofs,
    parseProofData,
} from "./proof/parse.js";
export {
    createDocument,
    documentToBlob,
    saveDocument,
} from "./pdf/document.js";
export { addCkvpCoverPage } from "./pdf/ckvpCoverPage.js";
export { addCouplingCodePage } from "./pdf/couplingCodePage.js";
export { addDccCoverPage } from "./pdf/dccCoverPage.js";
export { addEmptyPage } from "./pdf/emptyPage.js";
export { addProofPage } from "./pdf/proofPage.js";

// Legacy API
export { getDocument } from "./pdf/document.js";

// Deprecated
export { generateQR } from "./qr.js";
