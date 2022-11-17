export type TODO = any;

export type VaccinationStatus =
    | "unvaccinated"
    | "single-dose"
    | "single-dose-and-recovery"
    | "recent-double-dose"
    | "double-dose"
    | "triple-dose"
    | "unknown";

export type Locale = "nl" | "en";

export type ProofData = ProofDataV5 | ProofDataV6;

export type ProofDataV5 = {
    domestic?: DomesticProofData;
    european?: EuropeanProofData;
};

export type ProofDataV6 = {
    domestic?: DomesticProofData;
    european?: EuropeanProofData[];
    coupling_code?: string; // e.g. "CCUMZR"
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
    proofIdentifier: string;
    keyIdentifier?: string | null;
};

export type EuropeanProofData = {
    expirationTime: string; // ISO-8601 datetime
    dcc: {
        ver: "1.3.0"; // Schema Version
        nam: PersonName;
        dob: string; // ISO-8601 date (YYYY-MM-DD|YYYY-MM|YYYY)
        // Exactly 1 of the following must be present, empty not allowed
        v?: EuVaccinationCredential[]; // Vaccination group
        t?: EuTestCredential[]; // Test group
        r?: EuRecoveryCredential[]; // Recovery group
    };
    qr: string;
    proofIdentifier: string;
    keyIdentifier?: string | null;
};

type PersonName = {
    fn: string; // Surname | e.g. "de Vries"
    fnt: string; // Standardised Surname | e.g. "DE<VRIES"
    gn?: string; // Forename | e.g. "Henk"
    gnt?: string; // Standardised Forename | e.g. "HENK"
};

type BaseCredentials = {
    tg: string; // e.g. "840539006" // Disease or agent targeted
    ci: string; // e.g. "URN:UCI:01:NL:O5V7IYVTMFEJDB5SCIRH42#N" // Unique certificate identifier (UVCI) a
    co: string; // e.g. "NL" // Country expressed as a 2-letter ISO3166 code or a reference to an international organisation responsible for the vaccination event (such as UNHCR or WHO)
    is: string; // e.g. "Ministry of Health Welfare and Sport" // Name of the organisation that issued the certificate
};
export type EuVaccinationCredential = BaseCredentials & {
    vp: string; // e.g. "J07BX03"  // Type of the vaccine or prophylaxis used.
    mp: string; // e.g. "EU/1/20/1525" // Medicinal product used for this specific dose of vaccination
    ma: string; // e.g. "ORG-100001417" // Marketing authorisation holder or manufacturer
    dn: number; // e.g. 1 // Sequence number (positive integer) of the dose given during this vaccination event.
    sd: number; // e.g. 1 // Total number of doses (positive integer) in a complete vaccination series
    dt: string; // e.g. "2021-06-01" // The date when the described dose was received (YYYY-MM-DD)
};
export type EuTestCredential = BaseCredentials & {
    tt: string; // e.g. "LP6464-4"; // The type of the test used, based on the material targeted by the test
    nm?: string; // e.g. "ELITechGroup"; // The name of the nucleic acid amplification test (NAAT) used (Omit when RAT)
    ma?: string; // e.g. "1232"; // Rapid antigen test (RAT) device identifier from the JRC database (Omit when NAAT)
    sc: string; // e.g. "2021-06-29T08:28:34+00:00"; // The date and time when the test sample was collected.
    tr: string; // e.g. "260415000"; // The result of the test.
    tc: string; // e.g. "Facility approved by the State of The Netherlands"; // Member State or third country in which the test was carried out
};
export type EuRecoveryCredential = BaseCredentials & {
    fr: string; // e.g. "2021-06-29"; // The date when a sample for the NAAT test producing a positive result was collected
    df: string; // e.g. "2021-07-10"; // Certificate valid from
    du: string; // e.g. "2021-12-26"; // Certificate valid until
};

export type Proof = DomesticProof | EuropeanProof;

export type DisclosurePolicy = "3G" | "1G";

type DomesticProof = {
    proofType: "domestic";
    territory: "nl";
    qr: string;
    initials: string;
    validFromDate: number;
    birthDateStringShort: string;
    validFrom: string;
    validUntil: string;
    keyIdentifier: string | null;
    validAtMost15Days?: boolean;
    disclosurePolicy: DisclosurePolicy;
};

export type EuropeanProof =
    | EuropeanVaccinationProof
    | EuropeanNegativeTestProof
    | EuropeanRecoveryProof;

export type EuropeanVaccinationProof = EuropeanProofBase & {
    proofType: "european-vaccination";
    eventType: "vaccination";
    credential: EuVaccinationCredential;
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
    credential: EuTestCredential;
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
    credential: EuRecoveryCredential;
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

/**
 * HolderConfig
 */
export type HolderConfig = {
    "androidMinimumVersion": number; // e.g. 3249
    "androidRecommendedVersion": number; // e.g. 3734
    "androidMinimumVersionMessage": string; // e.g. "Om de app te gebruiken heb je de laatste versie uit de store nodig."
    "playStoreURL": string; // e.g. "https://play.google.com/store/apps/details?id=nl.rijksoverheid.ctr.holder"
    "iosMinimumVersion": string; // e.g. "2.7.1"
    "iosRecommendedVersion": string; // e.g. "3.0.1"
    "iosMinimumVersionMessage": string; // e.g. "Om de app te gebruiken heb je de laatste versie uit de store nodig."
    "iosAppStoreURL": string; // e.g. "https://apps.apple.com/nl/app/coronacheck/id1548269870"
    "appDeactivated": boolean;
    "mijnCnEnabled": boolean;
    "configTTL": number; // e.g. 1209600
    "configMinimumIntervalSeconds": number; // e.g. 43200
    "configAlmostOutOfDateWarningSeconds": number; // e.g. 86400
    "upgradeRecommendationInterval": number; // e.g. 24
    "maxValidityHours": number; // e.g. 24
    "informationURL": string; // e.g. "https://coronacheck.nl"
    "androidEnableVerificationPolicyVersion": number; // e.g. 0
    "iOSEnableVerificationPolicyVersion": string; // e.g. "0"
    "requireUpdateBefore": number; // e.g. 1620781181
    "ggdEnabled": boolean;
    "euLaunchDate": string; // e.g. "2021-06-30T22:00:00Z"
    "recoveryGreencardRevisedValidityLaunchDate": string; // e.g. "2021-11-30T01:00:00Z"
    "temporarilyDisabled": boolean;
    "vaccinationAssessmentEventValidityDays": number; // e.g. 14
    "visitorPassEnabled": boolean;
    "showNewValidityInfoCard": boolean;
    "vaccinationEventValidity": number; // e.g. 14600
    "vaccinationEventValidityDays": number; // e.g. 1095
    "recoveryEventValidity": number; // e.g. 8760
    "recoveryEventValidityDays": number; // e.g. 1095
    "recoveryExpirationDays": number; // e.g. 180
    "testEventValidity": number; // e.g. 336
    "testEventValidityHours": number; // e.g. 336
    "domesticCredentialValidity": number; // e.g. 24
    "credentialRenewalDays": number; // e.g. 4
    "clockDeviationThresholdSeconds": number; // e.g. 30
    "domesticQRRefreshSeconds": number; // e.g. 30
    "internationalQRRelevancyDays": number; // e.g. 28
    "luhnCheckEnabled": boolean;
    "proofSerializationVersion": string; // e.g. "2"
    "disclosurePolicy": [
        DisclosurePolicy
    ],
    "euTestResults": [
        {
            "code": string; // e.g. "260415000"
            "name": string  // e.g. "Negatief (geen corona)"
        }
    ],
    "hpkCodes": [
        {
            "code": string; // e.g. "2924528"
            "name": string; // e.g.  "Pfizer (Comirnaty)"
            "vp": string; // e.g.  "1119349007"
            "mp": string; // e.g.  "EU/1/20/1528"
            "ma": string; // e.g.  "ORG-100030215"
        }
    ],
    "euBrands": [
        {
            "code": string; // e.g. "EU/1/20/1528"
            "name": string; // e.g. "Pfizer (Comirnaty)"
        }
    ],
    "nlTestTypes": [
        {
            "code": string; // e.g. "pcr"
            "name": string; // e.g. "PCR Test"
        }
    ],
    "euVaccinations": [
        {
            "code": string; // e.g. "1119349007"
            "name": string; // e.g. "SARS-CoV-2 mRNA vaccine"
        }
    ],
    "euManufacturers": [
        {
            "code": string; // e.g. "ORG-100001699"
            "name": string; // e.g. "AstraZeneca AB"
        }
    ],
    "euTestTypes": [
        {
            "code": string; // e.g. "LP6464-4"
            "name": string; // e.g. "PCR (NAAT)"
        }
    ],
    "euTestManufacturers": [
        {
            "code": string; // e.g. "1341"
            "name": string; // e.g. "Qingdao Hightop Biotech Co."
        }
    ],
    "euTestNames": [
        {
            "code": string; // e.g. "1341"
            "name": string; // e.g. "SARS-CoV-2 Antigen Rapid Test"
        }
    ],
    "providerIdentifiers": [
        {
            "name": string; // e.g. "CTP-TEST-MVWS"
            "code": string; // e.g. "ZZZ"
        }
    ],
    "universalLinkDomains": [
        {
            "url": string; // e.g. "downloadclose.com"
            "name": string; // e.g. "Close app"
        }
    ]
};
