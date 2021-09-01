export function getDocument(args: {
    proofs: Proof[];
    locale: "en" | "nl";
    qrSizeInCm: number;
    createdAt: Date | number;
    metadata?: Metadata;
}): Promise<jsPDF>;
export type Metadata = import("./types").Metadata;
export type Locale = import("./types").Locale;
export type Proof = import("./types").Proof;
import { jsPDF } from "jspdf";
