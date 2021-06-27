import "core-js/features/promise";
import qrcode from "qrcode";

const cmToInch = 0.393700787;
const dpi = 300;

/**
 * @param {string} qrCode
 * @param {number} sizeInCm
 * @return {Promise<string>}
 */
export const generateQR = (qrCode, sizeInCm) => {
  const sizeInPixels = Math.round(sizeInCm * cmToInch * dpi);
  const qrOptions = {
    width: sizeInPixels,
    height: sizeInPixels,
    margin: 0,
    errorCorrectionLevel: "L",
  };
  return qrcode.toDataURL(qrCode, qrOptions);
};
