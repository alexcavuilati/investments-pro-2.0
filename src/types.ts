export interface User {
  id: number;
  email: string;
  name: string;
  tier: 'STANDARD' | 'PRO' | 'ENTERPRISE';
  kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  proof_of_funds_usd?: number;
  entity_type?: 'Individual' | 'Trust' | 'Company';
  country_of_origin?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  trial_ends_at?: string;
}

export interface Post {
  id: number;
  user_id: number;
  user_name: string;
  avatar_url: string;
  content: string;
  image_url: string;
  likes: number;
  type: 'NORMAL' | 'LISTING';
  country?: string;
  city?: string;
  price?: number;
  rent?: number;
  analysis_results?: string; // JSON string
  created_at: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  country: string;
  category: string;
  published_at: string;
}

export interface IncentiveScheme {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface FiscalVariables {
  stamp_duty_rate: number;
  vat_gst_rate: number;
  capital_gains_tax: number;
  incentives: IncentiveScheme[];
}

export interface ClimateRiskOverlay {
  flood_risk: number; // 1-100
  wildfire_risk: number; // 1-100
  sea_level_rise_impact: number; // 1-100
  projected_insurance_hike_10y: number; // percentage
  mandatory_green_retrofit_cost: number; // USD
  npv_adjustment_10y: number; // USD
  climate_summary: string;
}

export interface IoTDigitalTwin {
  hvac_status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  structural_integrity: number; // 1-100
  energy_efficiency_score: number; // 1-100
  predictive_maintenance_alerts: string[];
  last_sensor_sync: string;
}

export interface FractionalLiquidity {
  total_shards: number;
  shards_owned: number;
  shard_price_usd: number;
  is_tradable: boolean;
  blockchain_tx_id?: string;
}

export interface AgenticDealHunter {
  is_active: boolean;
  discount_threshold: number; // percentage below market
  max_bid_usd: number;
  auto_eoi_drafting: boolean;
  strategy_notes: string;
}

export interface Project {
  id: number;
  name: string;
  country: string;
  state_province?: string;
  city_district: string;
  purchase_price: number;
  fiscal_variables: FiscalVariables;
  projected_roi: number;
  irr: number;
  npv_estimate?: number;
  loan_readiness_score: number;
  eoi_ready: boolean;
  jurisdiction_laws?: {
    foreign_ownership: string;
    tax_residency: string;
    repatriation_rules: string;
    property_rights: string;
    legal_process: string;
    legal_fees: string;
  };
  risk_assessment?: {
    political_stability: number;
    currency_risk: number;
    liquidity_risk: number;
    regulatory_risk: number;
    overall_risk_score: number;
    risk_summary: string;
  };
  climate_risk?: ClimateRiskOverlay;
  iot_twin?: IoTDigitalTwin;
  liquidity?: FractionalLiquidity;
  deal_hunter?: AgenticDealHunter;
  created_at: string;
}

export interface JurisdictionLaw {
  foreign_ownership: string;
  tax_residency: string;
  repatriation_rules: string;
  property_rights: string;
  default_stamp_duty: number;
  default_vat_gst: number;
  default_cgt: number;
  common_incentives: Omit<IncentiveScheme, 'is_active'>[];
}

export const GLOBAL_JURISDICTION_DATA: Record<string, JurisdictionLaw> = {
  'FJ': {
    foreign_ownership: "99-year Crown/Native leases common. Freehold limited to 8% of land. Non-resident purchase requires approval.",
    tax_residency: "183 days rule. Residents taxed on global income; non-residents on Fiji-sourced income only.",
    repatriation_rules: "Reserve Bank of Fiji (RBF) approval required for all capital and profit remittances.",
    property_rights: "Strong Torrens system for Freehold; Leasehold governed by iTaukei Land Trust Board (TLTB).",
    default_stamp_duty: 10,
    default_vat_gst: 15,
    default_cgt: 10,
    common_incentives: [
      { id: 'fiji_slip', name: 'Fiji SLIP', description: 'Short Life Investment Package for tourism' }
    ]
  },
  'AU': {
    foreign_ownership: "FIRB approval mandatory for non-residents. Generally restricted to new dwellings or vacant land.",
    tax_residency: "Residency tests (Domicile/183 days). Non-residents taxed on AU-sourced income with no tax-free threshold.",
    repatriation_rules: "No restrictions on capital movement; transfers over $10k AUD reported to AUSTRAC.",
    property_rights: "Highly secure Torrens title system. Strong legal protections at Federal and State levels.",
    default_stamp_duty: 12,
    default_vat_gst: 10,
    default_cgt: 30,
    common_incentives: [
      { id: 'aus_firb', name: 'FIRB Exemption', description: 'Exemption from Foreign Investment Review Board fees' }
    ]
  },
  'US': {
    foreign_ownership: "Generally unrestricted. FIRPTA withholding (15%) applies on sale by foreign persons.",
    tax_residency: "Substantial Presence Test. US citizens and Green Card holders taxed on worldwide income.",
    repatriation_rules: "No restrictions. Transfers over $10k USD reported to FinCEN via Form 114 (FBAR).",
    property_rights: "Fee simple ownership. Title insurance is standard. Strong Constitutional property protections.",
    default_stamp_duty: 1.5,
    default_vat_gst: 0,
    default_cgt: 20,
    common_incentives: [
      { id: 'us_1031', name: '1031 Exchange', description: 'Tax-deferred exchange of like-kind investment property' }
    ]
  },
  'AE': {
    foreign_ownership: "100% ownership in designated 'Freehold Areas'. Golden Visa available for 2M+ AED investment.",
    tax_residency: "90/183 days rules. 0% personal income tax on property rental income and capital gains.",
    repatriation_rules: "No restrictions. Full capital and profit repatriation allowed via free zones and mainland.",
    property_rights: "Dubai Land Department (DLD) registration. Secure digital title deeds and escrow requirements.",
    default_stamp_duty: 4,
    default_vat_gst: 5,
    default_cgt: 0,
    common_incentives: [
      { id: 'uae_golden_visa', name: 'UAE Golden Visa', description: '10-year residency for property investors' }
    ]
  },
  'SG': {
    foreign_ownership: "Restricted for landed property (requires LDAU approval). Unrestricted for most condos. High ABSD for foreigners.",
    tax_residency: "183 days rule. Progressive income tax. No capital gains tax on property held for long term.",
    repatriation_rules: "No restrictions on capital movement. MAS monitors large transactions for AML.",
    property_rights: "Very strong. 99-year or 999-year leaseholds and freehold. Efficient digital land registry.",
    default_stamp_duty: 20,
    default_vat_gst: 9,
    default_cgt: 0,
    common_incentives: [
      { id: 'sg_absd_remission', name: 'ABSD Remission', description: 'Remission of Additional Buyer Stamp Duty for certain nationalities' }
    ]
  },
  'GB': {
    foreign_ownership: "Generally unrestricted. 2% surcharge on SDLT for non-residents. Register of Overseas Entities required.",
    tax_residency: "Statutory Residence Test. Non-domicile status possible but being phased out/reformed in 2026.",
    repatriation_rules: "No restrictions on capital movement. Strong banking compliance requirements.",
    property_rights: "Freehold and Leasehold. Land Registry is transparent and secure. Strong tenant protections.",
    default_stamp_duty: 5,
    default_vat_gst: 0,
    default_cgt: 28,
    common_incentives: [
      { id: 'uk_buy_to_let', name: 'Mortgage Interest Relief', description: 'Tax relief on mortgage interest for corporate structures' }
    ]
  },
  'NZ': {
    foreign_ownership: "Restricted under OIO. Generally requires residency or 'benefit to NZ' test for sensitive land.",
    tax_residency: "183 days or permanent place of abode. Global income taxed for residents.",
    repatriation_rules: "No restrictions. Anti-money laundering (AML) checks are rigorous.",
    property_rights: "Torrens system. High transparency. Strong legal framework for property ownership.",
    default_stamp_duty: 0,
    default_vat_gst: 15,
    default_cgt: 0,
    common_incentives: [
      { id: 'nz_bright_line', name: 'Bright-line Test Exemption', description: 'Exemption from tax if property held for more than 2 years (2026 rules)' }
    ]
  },
  'CA': {
    foreign_ownership: "Federal ban on non-resident purchase of residential property (extended to 2027). Exemptions for certain work permits and students.",
    tax_residency: "183 days rule. Global income taxed for residents. Underused Housing Tax (UHT) of 1% applies to non-residents.",
    repatriation_rules: "No restrictions. Large transactions monitored by FINTRAC.",
    property_rights: "Strong. Land title systems vary by province (Torrens in West, Registry in East). High legal security.",
    default_stamp_duty: 2,
    default_vat_gst: 5,
    default_cgt: 25,
    common_incentives: [
      { id: 'ca_rental_rebate', name: 'GST/HST Rental Rebate', description: 'Rebate for new residential rental property' }
    ]
  },
  'FR': {
    foreign_ownership: "Generally unrestricted. Wealth tax (IFI) applies to real estate assets over €1.3M.",
    tax_residency: "183 days or center of economic interests. High social charges for residents.",
    repatriation_rules: "No restrictions within EU. Standard AML reporting for external transfers.",
    property_rights: "Civil law system. Notary-led transactions. Strong tenant protections.",
    default_stamp_duty: 7,
    default_vat_gst: 20,
    default_cgt: 19,
    common_incentives: [
      { id: 'fr_pinel', name: 'Pinel Scheme', description: 'Tax reduction for investing in new rental properties in specific areas' }
    ]
  },
  'DE': {
    foreign_ownership: "Unrestricted. No specific foreign buyer taxes. Real estate transfer tax (Grunderwerbsteuer) varies by state.",
    tax_residency: "183 days or maintaining a residence. Progressive income tax.",
    repatriation_rules: "No restrictions. Bundesbank reporting for transfers over €12.5k.",
    property_rights: "Very strong. Grundbuch (land registry) is authoritative. High legal certainty.",
    default_stamp_duty: 5,
    default_vat_gst: 0,
    default_cgt: 25,
    common_incentives: [
      { id: 'de_depreciation', name: 'Sonder-AfA', description: 'Special depreciation for new affordable rental housing' }
    ]
  },
  'JP': {
    foreign_ownership: "Unrestricted. Foreigners can own land and buildings freehold. No specific surcharges.",
    tax_residency: "183 days rule. Residents taxed on global income. Non-residents taxed on JP-sourced income.",
    repatriation_rules: "No restrictions. Large transfers reported to Bank of Japan under Foreign Exchange Act.",
    property_rights: "Strong. Clear land registry system. Highly developed legal framework.",
    default_stamp_duty: 1.5,
    default_vat_gst: 10,
    default_cgt: 20,
    common_incentives: [
      { id: 'jp_depreciation', name: 'Building Depreciation', description: 'Accelerated depreciation for specific building types' }
    ]
  }
};

export interface KYCDocument {
  id: number;
  type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}
