export function getDocument(pages: Page[], locale: "en" | "nl", qrSizeInCm: number, metadata?: Metadata): Promise<jsPDF>;
export type Metadata = import("./types").Metadata;
export type Locale = import("./types").Locale;
export type Page = import("./types").Page;
import { jsPDF } from "jspdf";
