import * as img from "./assets/img";
import { t } from "./i18n";

/** @typedef {import("./types").Page} Page */
/** @typedef {import("./types").Locale} Locale */

/** @typedef {[number, number, number]} Color */
/** @typedef {[number, number]} Position */
/** @typedef {{ url: string, x: number, y: number, width: number, height: number }} ImageItem */
/** @typedef {{ color: Color, x1: number, y1: number, x2: number, y2: number }} Line */
/**
 * @typedef {Object} Frame
 * @property {Color} color
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} rx
 * @property {number} ry
 */
/**
 * @typedef {Object} TextItem
 * @property {string} text
 * @property {string} fontFamily
 * @property {number} fontWeight
 * @property {Position} position
 * @property {string} [textAlign]
 * @property {number} [fontSize]
 * @property {Color} [color]
 * @property {number} [width]
 * @property {number} [lineHeight]
 * @property {boolean} [hasHTML]
 */

const pageHeight = 297;
const pageWidth = 210;
const marginLeft = 10;
const marginLeftIntro = 15;
// jspdf uses the baseline of a text for an y position
const marginTop = 16;
const leftPartLeft = marginLeft;
const leftPartTop = 30;
const rightPartLeft = 0.5 * pageWidth + marginLeft;
const userDataColWidth = 60;
const rightPartRight = pageWidth - marginLeft;
const rightPartTop = marginTop;
const partWidth = 0.5 * pageWidth - 2 * marginLeft;
const partWidthIntro = 0.5 * pageWidth - 2 * marginLeftIntro;
const bottomPartTop = 0.5 * pageHeight + marginTop;
const marginQuestionsFrame = 4;
const questionsFrameHeight = 54;
const questionsFrameTop = pageHeight / 2 - marginLeft - questionsFrameHeight;
const questionsFrameInnerLeft = rightPartLeft + marginQuestionsFrame;
const questionsFrameInnerWidth = partWidth - 2 * marginQuestionsFrame;
const fontSizeStandard = 10;
const QrPositionY = 181;
const colSize = partWidth / 2 - marginLeft;
/** @type {Color} */
const lightBlack = [56, 56, 54];
export const lineHeight = 4.5;

/**
 * @param {Page} page
 * @param {Locale} locale
 * @return {TextItem[]}
 */
export const getTextItems = (page, locale) => {
    /** @type {TextItem[]} */
    const items = [
        {
            text: t(locale, page.territory + ".title"),
            fontFamily: "montserrat",
            fontWeight: 700,
            fontSize: 25,
            color: lightBlack,
            position: [leftPartLeft, leftPartTop],
            width: partWidth,
            textAlign: "center",
            lineHeight: 9,
        },
        {
            text: t(locale, page.territory + ".intro"),
            fontFamily: "dejavu-sans",
            fontWeight: 400,
            fontSize: fontSizeStandard,
            position: [marginLeftIntro, 51],
            width: partWidthIntro,
            textAlign: "center",
        },
        {
            text: t(locale, "instructions"),
            fontFamily: "montserrat",
            fontWeight: 700,
            fontSize: 18,
            color: lightBlack,
            position: [rightPartLeft, rightPartTop],
            width: partWidth,
        },
        {
            text:
                page.territory === "nl"
                    ? t(locale, "nl.instructions")
                    : t(locale, "eu." + page.type + ".instructions"),
            fontFamily: "dejavu-sans",
            fontWeight: 400,
            fontSize: fontSizeStandard,
            position: [rightPartLeft, 27],
            width: partWidth,
        },
        {
            text: t(locale, page.territory + "." + page.type + ".qrTitle"),
            fontFamily: "montserrat",
            fontWeight: 700,
            fontSize: 18,
            color: lightBlack,
            position: [marginLeftIntro, bottomPartTop],
            width: partWidthIntro,
            textAlign: "center",
            lineHeight: 6.5,
        },
    ];

    const userDetails = getUserDetails(page, locale);
    for (const userDetailItem of userDetails) {
        items.push(userDetailItem);
    }

    if (page.territory === "eu") {
        items.push({
            text: t(locale, "eu.warning"),
            fontFamily: "montserrat",
            fontWeight: 400,
            fontSize: 5,
            position: [leftPartLeft, 280],
            width: partWidth,
            lineHeight: 2.4,
        });
    }

    if (locale === "nl") {
        items.push({
            text: t("en", page.territory + "." + page.type + ".qrTitle"),
            fontFamily: "montserrat",
            fontWeight: 400,
            fontSize: 18,
            color: lightBlack,
            position: [marginLeftIntro, bottomPartTop + lineHeight * 1.5],
            width: partWidthIntro,
            textAlign: "center",
            lineHeight: 6.5,
        });
    }

    if (page.territory === "nl") {
        items.push(
            {
                text: t(locale, "nl.propertiesLabel"),
                fontFamily: "dejavu-sans",
                fontWeight: 700,
                fontSize: 10,
                position: [rightPartLeft, bottomPartTop],
                width: partWidth,
            },
            {
                text: t(locale, "questions"),
                fontFamily: "dejavu-sans",
                fontWeight: 700,
                fontSize: fontSizeStandard,
                position: [
                    questionsFrameInnerLeft,
                    questionsFrameTop + marginQuestionsFrame + lineHeight,
                ],
                width: questionsFrameInnerWidth,
            },
            {
                text: t(locale, "questionsContent"),
                fontFamily: "dejavu-sans",
                fontWeight: 400,
                fontSize: fontSizeStandard,
                position: [
                    questionsFrameInnerLeft,
                    questionsFrameTop + marginQuestionsFrame + 3 * lineHeight,
                ],
                width: questionsFrameInnerWidth,
                lineHeight: lineHeight,
            }
        );
    }

    return items;
};

/**
 * @param {Page} page
 * @param {Locale} locale
 * @return {TextItem[]}
 */
const getUserDetails = (page, locale) => {
    let string = "";
    if (page.territory === "nl") {
        const qr = page.qr;
        string += t(locale, "nl.userData.initials") + ": " + qr.initials + "\n";
        string +=
            t(locale, "nl.userData.dateOfBirth") +
            ": " +
            page.qr.birthDateStringShort +
            "\n";
        string +=
            t(locale, "nl.userData.validFrom") + ": " + qr.validFrom + "\n";
        if (page.type === "vaccination") {
            string +=
                "\n" +
                t(locale, "nl.userData.validUntilVaccination", {
                    date: qr.validUntil,
                }) +
                "\n\n";
        } else if (page.type === "negativetest") {
            string +=
                t(locale, "nl.userData.validUntil") +
                ": " +
                qr.validUntil +
                "\n\n";
        }
        string += t(locale, "nl.userData.privacyNote");
        return [
            {
                text: string,
                fontFamily: "dejavu-sans",
                fontWeight: 400,
                fontSize: fontSizeStandard,
                position: [rightPartLeft, bottomPartTop + 2 * lineHeight],
                width: partWidth,
            },
        ];
    } else {
        /** @type {TextItem[]} */
        const userDetails = [];
        const qr = page.qr;
        const fontSizeSmallCaps = 6.5;
        const fontSizeTinyCaps = 5;
        const lineHeightSmallCaps = fontSizeSmallCaps * 0.45;
        const fieldSpacing = lineHeightSmallCaps * 2.3;
        const fields = ["name", "dateOfBirth", "disease"];
        const values = [qr.fullName, qr.birthDateString, "COVID-19"];
        switch (page.type) {
            case "vaccination":
                fields.push(
                    "vaccin",
                    "vaccinType",
                    "vaccinManufacturer",
                    "doses",
                    "dateOfVaccination",
                    "countryOfVaccination",
                    "certificateIssuer"
                );
                break;
            case "negativetest":
                fields.push(
                    "testType",
                    "testName",
                    "testDate",
                    "testResult",
                    "testLocation",
                    "testManufacturer",
                    "countryOfTest",
                    "certificateIssuer",
                    "validUntil"
                );
                values.push(
                    qr.testType,
                    qr.testName,
                    qr.dateOfTest,
                    "Negative (no Corona)",
                    qr.testLocation,
                    qr.testManufacturer,
                    qr.countryOfTest,
                    qr.certificateIssuer,
                    qr.validUntil
                );
                break;
        }
        // fields
        let currentY = bottomPartTop;
        for (const field of fields) {
            userDetails.push({
                text: t(locale, "eu.userData." + field).toUpperCase(),
                fontFamily: "dejavu-sans",
                fontWeight: 700,
                fontSize: fontSizeSmallCaps,
                position: [rightPartLeft, currentY],
                width: partWidth,
            });
            currentY += lineHeightSmallCaps;
            if (locale === "nl") {
                userDetails.push({
                    text: t("en", "eu.userData." + field).toUpperCase(),
                    fontFamily: "dejavu-sans",
                    fontWeight: 400,
                    fontSize: fontSizeSmallCaps,
                    position: [rightPartLeft, currentY],
                    width: partWidth,
                });
            }
            currentY += fieldSpacing;
        }
        // certificateNumberString
        let certificateNumberString = t(
            locale,
            "eu.userData.certificateNumber"
        ).toUpperCase();
        if (locale === "nl") {
            certificateNumberString +=
                " / " + t("en", "eu.userData.certificateNumber").toUpperCase();
        }
        userDetails.push({
            text: certificateNumberString,
            fontFamily: "dejavu-sans",
            fontWeight: 400,
            fontSize: fontSizeTinyCaps,
            position: [rightPartLeft, currentY],
            width: partWidth,
        });
        currentY += lineHeightSmallCaps;
        userDetails.push({
            text: qr.certificateNumber,
            fontFamily: "dejavu-sans",
            fontWeight: 400,
            fontSize: fontSizeTinyCaps,
            position: [rightPartLeft, currentY],
            width: partWidth,
        });

        // values
        currentY = bottomPartTop;
        for (const value of values) {
            userDetails.push({
                text: value,
                fontFamily: "dejavu-sans",
                fontWeight: 700,
                fontSize: 9,
                position: [rightPartRight, currentY],
                width: userDataColWidth,
                textAlign: "right",
            });
            currentY += lineHeightSmallCaps + fieldSpacing;
        }

        // if (page.type === "vaccination") {
        //     string += "Surname(s) and first name(s): " + qr.fullName + "\n";
        //     string += "Date of birth: " + qr.birthDateString + "\n";
        //     string += "Disease targeted: COVID-19\n";
        //     string += "Vaccine: " + qr.vaccineBrand + "\n";
        //     string += "Vaccine medicinal product: " + qr.vaccineType + "\n";
        //     string += "Vaccine manufacturer: " + qr.vaccineManufacturer + "\n";
        //     string +=
        //         "Vaccination doses: " +
        //         qr.doseNumber +
        //         " out of " +
        //         qr.totalDoses +
        //         "\n";
        //     string += "Vaccination date: " + qr.vaccinationDate + "\n";
        //     string += "Vaccinated in: " + qr.vaccinationCountry + "\n";
        //     string += "Certificate issuer: " + qr.certificateIssuer + "\n";
        //     string +=
        //         "Certificate identifier: " + qr.certificateIdentifier + "\n\n";
        //     string += "Valid from: " + qr.validFrom + "\n\n";
        //     return string;
        // } else {
        //     return "UserData EU negative test (todo)";
        // }
        return userDetails;
    }
};

/**
 * @param {Page} page
 * @param {number} qrSizeInCm
 * @return {Promise<ImageItem[]>}
 */
export const getImageItems = async (page, qrSizeInCm) => {
    const qrSize = qrSizeInCm * 10;
    const coronacheckImageHeight = 10;
    const flagWidth = 63;
    const flagHeight = 42;
    const items = [
        {
            url: page.territory === "nl" ? img.flagNl : img.flagEu,
            x: (pageWidth / 2 - flagWidth) / 2,
            y: 87,
            width: flagWidth,
            height: flagHeight,
        },
        {
            url: page.urlQR,
            x: (pageWidth / 2 - qrSize) / 2,
            y: QrPositionY,
            width: qrSize,
            height: qrSize,
        },
        {
            url: img.foldInstructionsV2,
            x: 165,
            y: 6,
            width: 40,
            height: 15,
        },
    ];
    if (page.territory === "nl") {
        const questionsItem = {
            url: img.coronacheck,
            x: questionsFrameInnerLeft,
            y:
                questionsFrameTop +
                questionsFrameHeight -
                coronacheckImageHeight -
                marginQuestionsFrame,
            width: 47,
            height: coronacheckImageHeight,
        };
        items.push(questionsItem);
    }
    return items;
};

/**
 * @param {string} territory
 * @return {Frame[]}
 */
export const getFrames = (territory) => {
    if (territory === "eu") {
        return [];
    } else {
        return [
            {
                color: [239, 247, 249],
                x: rightPartLeft,
                y: questionsFrameTop,
                width: partWidth,
                height: questionsFrameHeight,
                rx: 4,
                ry: 4,
            },
        ];
    }
};

/**
 * @return {Line[]}
 */
export const getLines = () => {
    return [
        {
            color: [29, 29, 29],
            x1: 0,
            y1: pageHeight / 2,
            x2: pageWidth,
            y2: pageHeight / 2,
        },
        {
            color: [224, 224, 223],
            x1: pageWidth / 2,
            y1: 0,
            x2: pageWidth / 2,
            y2: pageHeight,
        },
    ];
};
