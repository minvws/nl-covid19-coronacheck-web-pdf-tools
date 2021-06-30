import { format } from "date-fns";

import { t } from "./i18n";
import { isNumeric, padLeft } from "./util";

/**
 * @param {import("./types").Locale} locale
 * @param {string|number} month
 * @return {string}
 */
export const monthNameShort = (locale, month) => t("date.months.abbr." + month);

/**
 * @param {string} birthDay
 * @param {string} birthMonth
 * @return {string}
 */
export const formatBirthDate = (birthDay, birthMonth) => {
    const birthDayShort = isNumeric(birthDay)
        ? padLeft(birthDay, 2, "0")
        : birthDay;
    const birthMonthShort = isNumeric(birthMonth)
        ? monthNameShort(birthMonth)
        : birthMonth;
    return birthDayShort + " " + birthMonthShort;
};

/**
 * @param {number|Date} dateTimeMs
 * @return {string}
 */
export const formatDate = (dateTimeMs) => format(dateTimeMs, "dd-MM-yyyy");

/**
 * @param {number|Date} dateTimeMs
 * @return {string}
 */
export const formatDateTime = (dateTimeMs) =>
    format(dateTimeMs, "dd-MM-yyyy, HH:mm");

/**
 * @param {string} hours
 * @return {number}
 */
export const hoursInMs = (hours) => parseInt(hours, 10) * 3600000;
