#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { basename, extname } from "path";
import mime from "mime";

const assetsDir = new URL("../assets", import.meta.url);
const outDir = new URL("../src/assets", import.meta.url);

const outputHeader = [
    "// Generated by scripts/convert-assets.js",
    "// DO NOT EDIT THIS FILE MANUALLY",
];

writeFileSync(
    fileURLToPath(outDir + "/fonts.js"),
    [
        ...outputHeader,
        ...readFiles(assetsDir + "/fonts").map(
            ({ filename, data }) =>
                `export var ${camelize(filename)} = "${data}";`
        ),
    ].join("\n")
);

writeFileSync(
    fileURLToPath(outDir + "/img.js"),
    [
        ...outputHeader,
        ...readFiles(assetsDir + "/img").map(
            ({ filename, data }) =>
                `export var ${camelize(filename)} = "${dataUri(
                    filename,
                    data
                )}";`
        ),
    ].join("\n")
);

writeFileSync(
    fileURLToPath(outDir + "/metadata.js"),
    [
        ...outputHeader,
        ...readFiles(assetsDir + "/metadata").map(
            ({ filename, data }) =>
                `export var ${camelize(filename)} = "${data}";`
        ),
    ].join("\n")
);

function readFiles(dirname) {
    return readdirSync(fileURLToPath(dirname))
        .filter(
            (filename) =>
                !statSync(fileURLToPath(dirname + "/" + filename)).isDirectory()
        )
        .map((filename) => ({
            filename,
            data: readFileSync(
                fileURLToPath(dirname + "/" + filename)
            ).toString("base64"),
        }));
}

function dataUri(filename, data) {
    return `data:${mime.getType(extname(filename).slice(1))};base64,${data}`;
}

function camelize(filename) {
    return basename(filename, extname(filename)).replace(/-./g, (match) =>
        match[1].toUpperCase()
    );
}
