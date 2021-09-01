import ComparePdf from "compare-pdf";
import { createWriteStream, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { parseProofData } from "./proof/parse.js";
import { getDocument } from "./pdf/document.js";

const holderConfig = JSON.parse(
    readFileSync(resolve(__dirname, "../test/holder-config.json"), {
        encoding: "utf8",
    })
);

const config = {
    paths: {
        actualPdfRootFolder: resolve(__dirname, "../test/actual"),
        baselinePdfRootFolder: resolve(__dirname, "../test/baseline"),
        actualPngRootFolder: resolve(__dirname, "../test/actual"),
        baselinePngRootFolder: resolve(__dirname, "../test/diff"),
        diffPngRootFolder: resolve(__dirname, "../test/diff"),
    },
    settings: {
        imageEngine: 'native',
		density: 150,
		quality: 80,
		tolerance: 5,
		threshold: 0.2,
    }
};

function writeStream(stream, filename) {
    return new Promise((resolve, reject) => {
        const target = createWriteStream(filename);
        stream.pipe(target);
        target.on('finish', resolve);
        target.on('error', reject);
    })
}

test("compare negativetest.pdf", async () => {
    const proofData = JSON.parse(
        readFileSync(resolve(__dirname, "../test/negativetest.json"), {
            encoding: "utf8",
        })
    );
    const proofs = parseProofData(proofData, holderConfig, "nl");
    const doc = getDocument({
        proofs,
        locale: "nl",
        qrSizeInCm: 8,
        createdAt: new Date("2021-09-01T13:37+02:00"),
    });
    const stream = writeStream(doc._pdf, resolve(__dirname, "../test/actual/negativetest.pdf"));
    doc._pdf.end();
    await stream;

    const result = await new ComparePdf(config)
        .actualPdfFile("negativetest.pdf")
        .baselinePdfFile("negativetest.pdf")
        .compare();

    expect(result.status).toEqual("passed");
}, 30000);
