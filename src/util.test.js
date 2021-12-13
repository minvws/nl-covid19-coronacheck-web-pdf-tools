import { parseMarkdownLinks } from "./util.js";

describe("parseMarkdownLinks", () => {
    test.each([
        ["no links here", ["no links here"]],
        [
            "[only a link](//here)",
            [
                {
                    text: "only a link",
                    url: "//here",
                },
            ],
        ],
        [
            "not [only a link](//here) in this text",
            [
                "not ",
                {
                    text: "only a link ",
                    url: "//here",
                },
                "in this text",
            ],
        ],
        [
            "[multiple](//links) in [this](//text)",
            [
                {
                    text: "multiple ",
                    url: "//links",
                },
                "in ",
                {
                    text: "this",
                    url: "//text",
                },
            ],
        ],
    ])("%s", (input, expected) =>
        expect(parseMarkdownLinks(input)).toEqual(expected)
    );
});
