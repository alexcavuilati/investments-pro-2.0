export interface JurisdictionInfo {
  vat_gst: number;
  stamp_duty: number;
  cgt: number;
  legal_process: string[];
  legal_fees_fixed: number;
  legal_fees_percent: number;
  restrictions: string[]; // List of countries NOT allowed to invest here
}

export const jurisdictionalData: Record<string, JurisdictionInfo> = {
  'FJ': {
    vat_gst: 15,
    stamp_duty: 3,
    cgt: 0,
    legal_process: [
      "FIRB Approval for non-residents",
      "Torrens System Title Search",
      "Stamp Duty Assessment",
      "Digital Title Registration via TLTB/Lands Dept"
    ],
    legal_fees_fixed: 2500,
    legal_fees_percent: 1.5,
    restrictions: []
  },
  'AU': {
    vat_gst: 10,
    stamp_duty: 4.5,
    cgt: 25,
    legal_process: [
      "FIRB Application (Mandatory for foreign entities)",
      "Conveyancing & Title Search",
      "PEXA Digital Settlement",
      "State Revenue Office Duty Payment"
    ],
    legal_fees_fixed: 1800,
    legal_fees_percent: 0.8,
    restrictions: ['RU', 'KP'] // Example restrictions
  },
  'NZ': {
    vat_gst: 15,
    stamp_duty: 0,
    cgt: 0,
    legal_process: [
      "OIO Consent (Overseas Investment Office)",
      "LINZ Title Transfer",
      "Anti-Money Laundering (AML) Verification",
      "Trust Account Settlement"
    ],
    legal_fees_fixed: 2200,
    legal_fees_percent: 1.0,
    restrictions: []
  },
  'AE': {
    vat_gst: 5,
    stamp_duty: 4,
    cgt: 0,
    legal_process: [
      "DLD (Dubai Land Department) Registration",
      "No Objection Certificate (NOC) from Developer",
      "Trustee Office Transfer",
      "Golden Visa Application (if > 2M AED)"
    ],
    legal_fees_fixed: 5000,
    legal_fees_percent: 2.0,
    restrictions: ['IL'] // Example historical restriction
  },
  'US': {
    vat_gst: 0, // Sales tax varies by state
    stamp_duty: 1.5,
    cgt: 15,
    legal_process: [
      "Title Insurance & Escrow Opening",
      "Home Inspection & Appraisal",
      "Closing Disclosure (CD) Review",
      "County Recorder Filing"
    ],
    legal_fees_fixed: 3500,
    legal_fees_percent: 1.2,
    restrictions: ['CU', 'IR', 'SY']
  }
};

export const getJurisdiction = (countryCode: string): JurisdictionInfo => {
  return jurisdictionalData[countryCode] || {
    vat_gst: 0,
    stamp_duty: 0,
    cgt: 0,
    legal_process: ["Standard International Property Acquisition Process"],
    legal_fees_fixed: 2000,
    legal_fees_percent: 1.0,
    restrictions: []
  };
};
