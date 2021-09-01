#!/usr/bin/env node

import { createWriteStream } from 'fs';
import { initDoc } from "../src/pdf.js";

const doc = initDoc();
doc.text("Hello");
doc.pipe(createWriteStream("foo.pdf"));
doc.end();
// doc.font("MontserratRegular").text("Hey ho");
