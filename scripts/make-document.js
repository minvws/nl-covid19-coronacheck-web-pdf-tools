#!/usr/bin/env node

import { JSDOM } from "jsdom";
import { createWriteStream, readFileSync } from "fs";
import { parseProofData } from "../src/proof/parse.js";
import { getDocument } from "../src/pdf/document.js";

const jsdom = new JSDOM().window;
global.DOMParser = jsdom.DOMParser;
global.atob = jsdom.atob;

const holderConfig = JSON.parse(
    readFileSync(new URL("../test/holder-config.json", import.meta.url))
);
const proofData = JSON.parse(
    readFileSync(new URL("../" + process.argv[2], import.meta.url))
);
const proofs = parseProofData(proofData, holderConfig, "nl");

getDocument({
    proofs,
    locale: process.argv[3] || "nl",
    qrSizeInCm: 8,
    createdAt: new Date("2021-09-01T13:37+02:00"),
})
    .then((doc) => {
        doc._pdf.pipe(process.stdout);
        doc._pdf.end();
    })
    .catch(console.error);