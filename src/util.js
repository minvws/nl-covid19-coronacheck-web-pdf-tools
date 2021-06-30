const NUM = /^\d+&/;

/**
 * @param {string} input
 * @param {number} length
 * @param {string} pad
 * @return {string}
 */
export const padLeft = (input, length, pad) =>
    input.length < length
        ? new Array(length - input.length + 1).join(pad) + input
        : input;

/**
 * @param {string} input
 * @return {boolean}
 */
export const isNumeric = NUM.test.bind(NUM);
