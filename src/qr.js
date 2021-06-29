import "core-js/features/promise";
import qrcode from "qrcode";

const cmToInch = 0.393700787;
const dpi = 300;

/**
 * @param {string} qrCode
 * @param {number} sizeInCm
 * @param {string} territory
 * @return {Promise<string>}
 */
export const generateQR = (qrCode, sizeInCm, territory) => {
    const sizeInPixels = Math.round(sizeInCm * cmToInch * dpi);
    const qrOptions = {
        width: sizeInPixels,
        height: sizeInPixels,
        margin: 0,
        errorCorrectionLevel: territory === "nl" ? "L" : "Q",
    };
    return qrcode.toDataURL(qrCode, qrOptions);
};
