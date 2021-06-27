export type jsPDF = import("jspdf").jsPDF;

export type EventType = "negativeTest" | "vaccination";

export type Locale = "nl" | "en";

export type Metadata = { title: string; author: string };

export type QRData = NLQRData | EUQRData;

export type NLQRData = {
  initials: string;
  validFromDate: number;
  birthDateStringShort: string;
  validFrom: string;
  validUntil: string;
};

// TODO
export type EUQRData = any;

export type Page = NLPage | EUPage;

export type NLPage = {
  type: EventType;
  territory: "nl";
  qr: NLQRData;
  urlQR: string;
};

export type EUPage = {
  type: EventType;
  territory: "eu";
  qr: EUQRData;
  urlQR: string;
};
