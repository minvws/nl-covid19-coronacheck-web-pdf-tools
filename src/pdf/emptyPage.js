export function addEmptyPage(doc) {
    doc._addPage(function () {
        doc._pdf.addPage({ margin: 0, size: "A4" });
    });
}
