import {
    formatBirthDate,
    formatDate,
    formatDateTime,
    hoursInMs,
} from "./date";

describe("formatBirthDate", () => {
    /** @type {["nl"|"en", string, string, string][]} */
    const cases = [
        ["nl", "1", "5", "01 MEI"],
        ["en", "1", "5", "01 MAY"],
        ["nl", "10", "10", "10 OKT"],
        ["en", "10", "10", "10 OCT"],
        ["nl", "31", "2", "31 FEB"],
    ];
    test.each(cases)("[%s] %j, %j => %j", (locale, day, month, expected) => {
        expect(formatBirthDate(day, month, locale)).toBe(expected);
    });
});

describe("formatDate", () => {
    test.each([
        ["1970-01-01", "01-01-1970"],
        ["2021-07-27T07:41:10+00:00", "27-07-2021"],
        ["2021-07-27T07:41:10-13:00", "27-07-2021"],
        ["2021-07-27T07:41:10+13:00", "27-07-2021"],
        ["2021-12-31T13:37Z", "31-12-2021"],
        ["12/31/2020", "12/31/2020"],
        ["1970-XX-XX", "XX-XX-1970"],
        ["yesterday", "yesterday"],
        ["", ""],
    ])("%j => %j", (input, expected) => {
        expect(formatDate(input)).toBe(expected);
    });
});

describe("formatDateTime", () => {
    test.each([
        ["1970-01-01", "01-01-1970"],
        ["2021-07-27T07:41:10", "27-07-2021, 07:41"],
        ["2021-07-27T07:41:10Z", "27-07-2021, 07:41 (UTC)"],
        ["2021-07-27T07:41:10+00:00", "27-07-2021, 07:41 (UTC)"],
        ["2021-07-27T09:41:10+02:00", "27-07-2021, 09:41 (UTC+02:00)"],
        ["2021-07-27T09:41:10.1234+02:00", "27-07-2021, 09:41 (UTC+02:00)"],
        ["2021-07-27T04:41:10-3", "27-07-2021, 04:41 (UTC-3)"],
        ["2021-12-31T13:37Z", "31-12-2021, 13:37 (UTC)"],
        ["12/31/2020", "12/31/2020"],
        ["1970-XX-XX", "XX-XX-1970"],
        ["yesterday", "yesterday"],
        ["", ""],
    ])("%j => %j", (input, expected) => {
        expect(formatDateTime(input)).toBe(expected);
    });
});

// TODO: run tests in specific timezone? (won't work on Windows)
test.todo("formatTimestamp")

describe("hoursInMs", () => {
    test.each([
        ["1", 3600000],
        ["5", 18000000],
        ["-1", -3600000],
    ])("%j => %j", (input, expected) => {
        expect(hoursInMs(input)).toBe(expected);
    });
});
