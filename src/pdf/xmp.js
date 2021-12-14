/**
 * @typedef {Object} Metadata
 * @property {string} title
 * @property {string} author
 * @property {string} creator
 * @property {Date} createdAt
 */

/**
 * @param {import("pdfkit/js/pdfkit.standalone.js")} pdf
 * @param {Metadata} metadata
 */
export function addXmp(pdf, metadata) {
    var xmpRef = pdf.ref({ Type: "Metadata", Subtype: "XML" });
    xmpRef.compress = false;
    xmpRef.write(xmp(metadata));
    xmpRef.end();
    pdf._root.data.Metadata = xmpRef;
}

/**
 * @param {Metadata} metadata
 */
export function xmp(metadata) {
    var createdAt = metadata.createdAt.toISOString();
    var timestamp = metadata.createdAt.getTime();
    var uuid = timestamp + "-" + Math.floor(424242 * Math.random());

    return [
        '<?xpacket begin="\xEF\xBB\xBF" id="W5M0MpCehiHzreSzNTczkc9d"?>',
        '  <x:xmpmeta xmlns:x="adobe:ns:meta/">',
        '    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',

        '      <rdf:Description rdf:about="uuid:' +
            uuid +
            '" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">',
        "        <pdf:Producer>" + metadata.creator + "</pdf:Producer>",
        "      </rdf:Description>",

        '      <rdf:Description rdf:about="uuid:' +
            uuid +
            '" xmlns:xmp="http://ns.adobe.com/xap/1.0/">',
        "        <xmp:CreateDate>" + createdAt + "</xmp:CreateDate>",
        "        <xmp:ModifyDate>" + createdAt + "</xmp:ModifyDate>",
        "        <xmp:MetadataDate>" + createdAt + "</xmp:MetadataDate>",
        "        <xmp:CreatorTool>" + metadata.creator + "</xmp:CreatorTool>",
        "      </rdf:Description>",

        '      <rdf:Description rdf:about="uuid:' +
            uuid +
            '" xmlns:dc="http://purl.org/dc/elements/1.1/">',
        '        <dc:title><rdf:Alt><rdf:li xml:lang="x-default">' +
            metadata.title +
            "</rdf:li></rdf:Alt></dc:title>",
        "        <dc:creator><rdf:Seq><rdf:li>" +
            metadata.author +
            "</rdf:li></rdf:Seq></dc:creator>",
        "      </rdf:Description>",

        '      <rdf:Description rdf:about="uuid:' +
            uuid +
            '" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/" >',
        "        <pdfaid:part>3</pdfaid:part>",
        "        <pdfaid:conformance>A</pdfaid:conformance>",
        "      </rdf:Description>",

        '      <rdf:Description rdf:about="uuid:' +
            uuid +
            '" xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/">',
        "        <pdfuaid:part>1</pdfuaid:part>",
        "      </rdf:Description>",

        '      <rdf:Description rdf:about="uuid:' +
            uuid +
            '" xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/">',
        "        <xmpMM:DocumentID>uuid:" + uuid + "</xmpMM:DocumentID>",
        "      </rdf:Description>",
        "    </rdf:RDF>",
        "  </x:xmpmeta>",
        '<?xpacket end="w"?>',
    ].join("\n");
}
