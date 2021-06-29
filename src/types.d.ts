export type EventType = "negativetest" | "vaccination" | "recovery";

export type Locale = "nl" | "en";

export type Metadata = { title: string; author: string };

export type ProofData = {
    domestic?: DomesticProofData;
    european?: EuropeanProofData;
};

export type DomesticProofData = {
    attributes: {
        isSpecimen: string; // "1" | "0"
        isPaperProof: string; // "1" | "0"
        validFrom: string; // timestamp (seconds)
        validForHours: string; // number
        firstNameInitial: string; // e.g. "H"
        lastNameInitial: string; // e.g. "V"
        birthDay: string; // number
        birthMonth: string; // number
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

type VaccinationCredential = {
    tg: string; // e.g. "840539006"
    ci: string; // e.g. "URN:UCI:01:NL:O5V7IYVTMFEJDB5SCIRH42#N"
    co: string; // e.g. "NL"
    is: string; // e.g. "Ministry of Health Welfare and Sport"
    vp: string; // e.g. "J07BX03"
    mp: string; // e.g. "EU/1/20/1525"
    ma: string; // e.g. "ORG-100001417"
    dn: number; // e.g. 1
    sd: number; // e.g. 1
    dt: string; // e.g. "2021-06-01"
};
// TODO
type TestCredential = any
type RecoveryCredential = any

export type Proof =
    | DomesticVaccinationProof
    | DomesticNegativeTestProof
    | EuropeanVaccinationProof
    | EuropeanNegativeTestProof
    | EuropeanRecoveryProof;

type DomesticProof = {
    territory: "nl";
    qr: string;
    initials: string;
    validFromDate: number;
    birthDateStringShort: string;
    validFrom: string;
    validUntil: string;
};

export type DomesticVaccinationProof = DomesticProof & {
    proofType: "domestic-vaccination";
    eventType: "vaccination";
};

export type DomesticNegativeTestProof = DomesticProof & {
    proofType: "domestic-negative-test";
    eventType: "negativetest";
};

type EuropeanProof = {
    territory: "eu";
    qr: string;
    fullName: string;
    birthDateString: string;
    certificateNumber: string;
    validUntil: string;
};

export type EuropeanVaccinationProof = EuropeanProof & {
    proofType: "european-vaccination";
    eventType: "vaccination";
    credential: VaccinationCredential;
    vaccineBrand: string;
    vaccineManufacturer: string;
    vaccineType: string;
    doseNumber: number;
    totalDoses: number;
    vaccinationDate: string;
    vaccinationCountry: string;
    certificateIssuer: string;
    certificateIdentifier: string;
    validFrom: string;
};

export type EuropeanNegativeTestProof = EuropeanProof & {
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
export type EuropeanRecoveryProof = EuropeanProof & {
    proofType: "european-recovery";
    eventType: "recovery";
    credential: RecoveryCredential;
    // TODO
};
