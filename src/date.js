import { format } from "date-fns";

import { t } from "./i18n";
import { isNumeric, padLeft } from "./util";

/**
 * @param {string|number} month
 * @param {import("./types").Locale} locale
 * @return {string}
 */
export const monthNameShort = (month, locale) =>
    t(locale, "date.months.abbr." + month);

/**
 * @param {string} birthDay
 * @param {string} birthMonth
 * @param {import("./types").Locale} locale
 * @return {string}
 */
export const formatBirthDate = (birthDay, birthMonth, locale) => {
    const birthDayShort = isNumeric(birthDay)
        ? padLeft(birthDay, 2, "0")
        : birthDay;
    const birthMonthShort = isNumeric(birthMonth)
        ? monthNameShort(birthMonth, locale)
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
