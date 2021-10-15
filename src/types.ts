export type TODO = any;

export type VaccinationStatus =
    | "unvaccinated"
    | "single-dose"
    | "single-dose-and-recovery"
    | "recent-double-dose"
    | "double-dose"
    | "triple-dose"
    | "unknown";

export type EventType = "negativetest" | "vaccination" | "recovery";

export type Locale = "nl" | "en";

export type Metadata = { title: string; author: string };

export type ProofData = ProofDataV5 | ProofDataV6;

export type ProofDataV5 = {
    domestic?: DomesticProofData;
    european?: EuropeanProofData;
};

export type ProofDataV6 = {
    domestic?: DomesticProofData;
    european?: EuropeanProofData[];
};

export type DomesticProofData = {
    attributes: {
        isSpecimen: string; // "1" | "0"
        isPaperProof: string; // "1" | "0"
        validFrom: string; // timestamp (seconds)
        validForHours: string; // number
        firstNameInitial: string; // e.g. "H"
        lastNameInitial: string; // e.g. "V"
        birthDay: string; // e.g. "31"
        birthMonth: string; // e.g. "5"
    };
    qr: string;
};

export type EuropeanProofData = {
    expirationTime: string; // ISO-8601 datetime
    dcc: {
        ver: "1.3.0";
        nam: {
            fn: string; // e.g. "de Vries"
            fnt: string; // e.g. "DE<VRIES"
            gn: string; // e.g. "Henk"
            gnt: string; // e.g. "HENK"
        };
        dob: string; // ISO-8601 date (yyyy-mm-dd)
        v: VaccinationCredential[] | null;
        t: TestCredential[] | null;
        r: RecoveryCredential[] | null;
    };
    qr: string;
};

type BaseCredentials = {
    tg: string; // e.g. "840539006"
    ci: string; // e.g. "URN:UCI:01:NL:O5V7IYVTMFEJDB5SCIRH42#N"
    co: string; // e.g. "NL"
    is: string; // e.g. "Ministry of Health Welfare and Sport"
};
type VaccinationCredential = BaseCredentials & {
    vp: string; // e.g. "J07BX03"
    mp: string; // e.g. "EU/1/20/1525"
    ma: string; // e.g. "ORG-100001417"
    dn: number; // e.g. 1
    sd: number; // e.g. 1
    dt: string; // e.g. "2021-06-01"
};
type TestCredential = BaseCredentials & {
    tt: string; // e.g. "LP6464-4";
    nm: string; // e.g. "";
    ma: string; // e.g. "1232";
    sc: string; // e.g. "2021-06-29T08:28:34+00:00";
    tr: string; // e.g. "260415000";
    tc: string; // e.g. "Facility approved by the State of The Netherlands";
};
type RecoveryCredential = BaseCredentials & {
    fr: string; // e.g. "2021-06-29";
    df: string; // e.g. "2021-07-10";
    du: string; // e.g. "2021-12-26";
};

export type Proof = DomesticProof | EuropeanProof;

type DomesticProof = {
    proofType: "domestic";
    territory: "nl";
    qr: string;
    initials: string;
    validFromDate: number;
    birthDateStringShort: string;
    validFrom: string;
    validUntil: string;
};

export type EuropeanProof =
    | EuropeanVaccinationProof
    | EuropeanNegativeTestProof
    | EuropeanRecoveryProof;

export type EuropeanVaccinationProof = EuropeanProofBase & {
    proofType: "european-vaccination";
    eventType: "vaccination";
    credential: VaccinationCredential;
    vaccineBrand: string;
    vaccineManufacturer: string;
    vaccineType: string;
    doseNumber: number;
    totalDoses: number;
    doses: string;
    vaccinationDate: string;
    vaccinationCountry: string;
    certificateIssuer: string;
    certificateIdentifier: string;
    validFrom: string;
};

export type EuropeanNegativeTestProof = EuropeanProofBase & {
    proofType: "european-negative-test";
    eventType: "negativetest";
    credential: TestCredential;
    testType: string;
    testName: string;
    dateOfTest: string;
    testLocation: string;
    testManufacturer: string;
    countryOfTest: string;
    certificateIssuer: string;
    validFrom: string;
};
export type EuropeanRecoveryProof = EuropeanProofBase & {
    proofType: "european-recovery";
    eventType: "recovery";
    credential: RecoveryCredential;
    validFrom: string;
    dateOfTest: string;
    countryOfTest: string;
    certificateIssuer: string;
};

type EuropeanProofBase = {
    territory: "eu";
    qr: string;
    fullName: string;
    birthDateString: string;
    certificateNumber: string;
    validUntil: string;
};
