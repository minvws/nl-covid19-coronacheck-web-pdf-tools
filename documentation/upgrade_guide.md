# Upgrade Guide

This document describes how to upgrade the coronacheck-web-pdf-tools to an expected version.

### From 4.0.x to 4.1.x

* Some function parameters have been changed:
    * `addCkvpCoverPage()` `allProofs` parameter replaces `proofsFound` parameter

```js
// 4.0.x
addCkvpCoverPage(doc, {
    address: nameData,
    proofsFound: true,
    createdAt: createdAt,
    packageNumber: envelopeNumber,
    totalPackages: totalEnvelopes,
    version: version,
    pageNumber: pageNumber,
    totalPages: totalPages,
});
// 4.1.x
addCkvpCoverPage(doc, {
    address: nameData,
    allProofs: parsedProofs,
    createdAt: createdAt,
    packageNumber: envelopeNumber,
    totalPackages: totalEnvelopes,
    version: version,
    pageNumber: pageNumber,
    totalPages: totalPages,
});
```

### From 3.9.x to 4.0.0

* Some function parameters have been changed:
    * `addDccCoverPage()` now accepts `doc`, `args`
    * `addCouplingCodePage()` now accepts `doc`, `args`

```js
// 3.9.x
addDccCoverPage(
    doc,
    proofs,
    createdAt,
    internationalProofScanned
);
// 4.x.x
addDccCoverPage( doc, {
    proofs: proofs,
    createdAt: createdAt,
    internationalProofScanned: internationalProofScanned
});

// 3.9.x
addCouplingCodePage( doc, couplingCode );
// 4.x.x
addCouplingCodePage( doc, {couplingCode: couplingCode} );
```
