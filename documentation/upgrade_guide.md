# Upgrade Guide

This document describes how to upgrade the coronacheck-web-pdf-tools to an expected version.

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
