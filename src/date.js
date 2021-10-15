import { t } from "./i18n/index.js";
import { isNumeric, padLeft } from "./util.js";

// ISO8601 date format. Does not support week number or day-of-year notation,
// but does accept "XX" placeholders for month and date.
var ISO8601 =
    /^(\d{4}-(?:\d{2}|XX)-(?:\d{2}|XX))(?:T(\d\d:\d\d(?::\d\d)?)(\.\d+)?(.*))?$/i;

/**
 * @param {string} birthDay
 * @param {string} birthMonth
 * @param {import("./types").Locale} locale
 * @return {string}
 */
export function formatBirthDate(birthDay, birthMonth, locale) {
    var birthDayShort = isNumeric(birthDay)
        ? padLeft(birthDay, 2, "0")
        : birthDay;
    var birthMonthShort = isNumeric(birthMonth)
        ? monthNameShort(birthMonth, locale)
        : birthMonth;
    return birthDayShort + " " + birthMonthShort;
}

/**
 * @param {string} isoDateString
 * @return {string}
 */
export function formatDate(isoDateString) {
    var matches =
        typeof isoDateString === "string" && isoDateString.match(ISO8601);
    return matches ? flipDate(matches[1]) : isoDateString;
}

/**
 * @param {number} n
 * @return {string}
 */
function pad(n) {
    return n < 10 ? "0" + n : "" + n;
}

var formatter =
    typeof Intl !== "undefined" &&
    new Intl.DateTimeFormat("nl-NL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
    });

/**
 * @param {Date|number|string} datetime - Date instance, timestamp in ms, or ISO8601 string
 * @return {string}
 */
export function formatLocalDate(datetime) {
    if (!(datetime instanceof Date)) datetime = new Date(datetime);
    return (
        pad(datetime.getDate()) +
        "-" +
        pad(datetime.getMonth() + 1) +
        "-" +
        datetime.getFullYear()
    );
}

/**
 * @param {Date|number|string} datetime - Date instance, timestamp in ms, or ISO8601 string
 * @return {string}
 */
export function formatLocalDateTime(datetime) {
    if (!(datetime instanceof Date)) datetime = new Date(datetime);
    if (
        formatter &&
        formatter.resolvedOptions &&
        formatter.resolvedOptions().timeZone
    ) {
        try {
            var parts = formatter.format(datetime).split(" ");
            return parts[0] + ", " + parts[1] + " (" + parts[2] + ")";
        } catch (e) {
            // fall back to non-Intl method
        }
    }
    var offset = datetime.getTimezoneOffset();
    return (
        pad(datetime.getDate()) +
        "-" +
        pad(datetime.getMonth() + 1) +
        "-" +
        datetime.getFullYear() +
        ", " +
        pad(datetime.getHours()) +
        ":" +
        pad(datetime.getMinutes()) +
        " (" +
        formatOffset(offset) +
        ")"
    );
}

/**
 * @param {string} hours
 * @return {number}
 */
export function hoursInMs(hours) {
    return parseInt(hours, 10) * 3600000;
}

/**
 * @param {string} isoDate
 * @return {string}
 */
function flipDate(isoDate) {
    var parts = isoDate.slice(0, 10).split("-");
    return parts[2] + "-" + parts[1] + "-" + parts[0];
}

/**
 * @param {string|number} month
 * @param {import("./types").Locale} locale
 * @return {string}
 */
function monthNameShort(month, locale) {
    return t(locale, "date.months.abbr." + month);
}

/**
 * @param {number|string} offset
 * @return {string}
 */
function formatOffset(offset) {
    if (!offset) return "UTC";
    if (typeof offset === "number") {
        var oh = Math.floor(Math.abs(offset / 60));
        var om = Math.floor(Math.abs(offset % 60));
        return (
            "UTC" + (offset < 0 ? "+" : "-") + oh + (om ? ":" + pad(om) : "")
        );
    }
    if (offset === "Z") return "UTC";
    var parts = offset.split(":");
    if (parseInt(parts[0], 10) || parseInt(parts[1], 10)) {
        return "UTC" + offset;
    }
    return "UTC";
}
