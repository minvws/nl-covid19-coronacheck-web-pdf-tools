import en from "./i18n/numberFormat/en.js";
import nl from "./i18n/numberFormat/nl.js";

const replacementPatterns = { en, nl };

/**
 * @param {import("./types").Locale} locale
 * @return string
 */
export function NumberFormat(locale) {
    this.funcpattern =
        /(\|?(\uE008\()+)?(\|?\uE008\(([^\(\)]*)\)\|?)(\uE00A?\)+\|?)?/;

    this._run = function (data, begin, end) {
        // console.log("New run", data, begin, end);
        for (var i in replacementPatterns[locale]) {
            var replacementPattern = replacementPatterns[locale][i];
            if (
                (begin && !replacementPattern.begin) ||
                (end && !replacementPattern.end)
            ) {
                // console.log(0, replacementPattern.pattern);
                var replacementPatternFound = new RegExp(
                    replacementPattern.pattern
                ).exec(data);
                if (replacementPatternFound != null) {
                    var replacedString = data.replace(
                        new RegExp(replacementPattern.pattern),
                        replacementPattern.replacement
                    );
                    var newString = this.funcpattern.exec(replacedString);
                    // console.log(1, newString);
                    while (newString != null) {
                        var isBeginning = false;
                        var isEnd = false;
                        if (
                            newString[3][0] === "|" ||
                            newString[0][0] === "|"
                        ) {
                            isBeginning = true;
                        } else if (newString.index === 0) {
                            isBeginning = begin;
                        }
                        if (
                            newString[3][newString[0].length - 1] === "|" ||
                            newString[3][newString[0].length - 1] === "|"
                        ) {
                            isEnd = true;
                        } else if (
                            newString.index + newString[0].length ===
                            replacedString.length
                        ) {
                            isEnd = end;
                        }
                        replacedString =
                            replacedString.substring(
                                0,
                                newString.index +
                                    (newString[1] === undefined
                                        ? 0
                                        : newString[1].length)
                            ) +
                            this._run(newString[4], isBeginning, isEnd) +
                            replacedString.substring(
                                newString.index +
                                    (newString[1] === undefined
                                        ? 0
                                        : newString[1].length) +
                                    newString[3].length
                            );
                        newString = this.funcpattern.exec(replacedString);
                        // console.log(2, newString);
                        // console.log(3, replacedString);
                    }
                    return replacedString;
                }
            }
        }
        return "";
    };

    this.run = function (data) {
        return this._run(data, true, true);
    };
}
