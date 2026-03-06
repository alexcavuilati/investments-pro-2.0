import { GoogleGenAI, Type } from "@google/genai";
import { FiscalVariables } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const fiscalIntelligence = async (params: {
  country: string;
  state_province: string;
  city_district: string;
  purchase_price: number;
  monthly_rent: number;
  fiscal_variables: FiscalVariables;
}) => {
  const prompt = `Act as a 2026 Global Property Tax & Legal Expert. 
  Using REAL-TIME GLOBALLY AVAILABLE DATA for ${params.country}, analyze a property investment with the following parameters:
  - Location: ${params.city_district}, ${params.state_province}, ${params.country}
  - Purchase Price: $${params.purchase_price}
  - Projected Monthly Rent: $${params.monthly_rent}
  - Stamp Duty Rate: ${params.fiscal_variables.stamp_duty_rate}%
  - VAT/GST Rate: ${params.fiscal_variables.vat_gst_rate}%
  - Capital Gains Tax: ${params.fiscal_variables.capital_gains_tax}%
  - Incentives: ${params.fiscal_variables.incentives.map(i => `${i.name} (${i.is_active ? 'Active' : 'Inactive'})`).join(', ')}

  MANDATORY: Use Google Search to find the LATEST 2026 tax codes, legal processes, and ALL associated fees for real estate investment in ${params.country}.
  
  Calculate the 2026 ROI and IRR considering:
  1. Total Acquisition Cost = Purchase Price + (Purchase Price * Stamp Duty Rate) + (Estimated Legal & Admin Fees from Search)
  2. Annual Gross Income = Monthly Rent * 12
  3. Net Income = Annual Gross Income - (Annual Gross Income * VAT/GST Rate) - (Estimated Operating Expenses & Property Taxes from Search)
  4. Climate-Adaptive Adjustment: Factor in projected 10-year insurance hikes and mandatory green-retrofit costs found via search.
  5. ROI = (Net Income / Total Acquisition Cost) * 100
  6. NPV = Calculate the 10-year Net Present Value (NPV) adjusted for the climate risk factors above.

  Provide a JSON response with:
  - tax_implications: string (Detailed real-time tax breakdown)
  - projected_roi: number (percentage)
  - irr_estimate: number (percentage)
  - npv_estimate: number (USD value)
  - loan_readiness_score: number (1-100)
  - eoi_ready: boolean
  - jurisdiction_laws: object with keys: foreign_ownership (string), tax_residency (string), repatriation_rules (string), property_rights (string), legal_process (string), legal_fees (string), financial_institutions (string)
  - legal_checklist: string[]
  - recalibration_notes: string (Mention any real-time updates found)
  - risk_assessment: object with keys: political_stability (number 1-100), currency_risk (number 1-100), liquidity_risk (number 1-100), regulatory_risk (number 1-100), overall_risk_score (number 1-100), risk_summary (string)
  - climate_risk: object with keys: flood_risk (number 1-100), wildfire_risk (number 1-100), sea_level_rise_impact (number 1-100), projected_insurance_hike_10y (number), mandatory_green_retrofit_cost (number), npv_adjustment_10y (number), climate_summary (string)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tax_implications: { type: Type.STRING },
            projected_roi: { type: Type.NUMBER },
            irr_estimate: { type: Type.NUMBER },
            npv_estimate: { type: Type.NUMBER },
            loan_readiness_score: { type: Type.NUMBER },
            eoi_ready: { type: Type.BOOLEAN },
            jurisdiction_laws: {
              type: Type.OBJECT,
              properties: {
                foreign_ownership: { type: Type.STRING },
                tax_residency: { type: Type.STRING },
                repatriation_rules: { type: Type.STRING },
                property_rights: { type: Type.STRING },
                legal_process: { type: Type.STRING },
                legal_fees: { type: Type.STRING },
                financial_institutions: { type: Type.STRING }
              },
              required: ["foreign_ownership", "tax_residency", "repatriation_rules", "property_rights", "legal_process", "legal_fees", "financial_institutions"]
            },
            legal_checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            recalibration_notes: { type: Type.STRING },
            risk_assessment: {
              type: Type.OBJECT,
              properties: {
                political_stability: { type: Type.NUMBER },
                currency_risk: { type: Type.NUMBER },
                liquidity_risk: { type: Type.NUMBER },
                regulatory_risk: { type: Type.NUMBER },
                overall_risk_score: { type: Type.NUMBER },
                risk_summary: { type: Type.STRING }
              },
              required: ["political_stability", "currency_risk", "liquidity_risk", "regulatory_risk", "overall_risk_score", "risk_summary"]
            },
            climate_risk: {
              type: Type.OBJECT,
              properties: {
                flood_risk: { type: Type.NUMBER },
                wildfire_risk: { type: Type.NUMBER },
                sea_level_rise_impact: { type: Type.NUMBER },
                projected_insurance_hike_10y: { type: Type.NUMBER },
                mandatory_green_retrofit_cost: { type: Type.NUMBER },
                npv_adjustment_10y: { type: Type.NUMBER },
                climate_summary: { type: Type.STRING }
              },
              required: ["flood_risk", "wildfire_risk", "sea_level_rise_impact", "projected_insurance_hike_10y", "mandatory_green_retrofit_cost", "npv_adjustment_10y", "climate_summary"]
            }
          },
          required: ["tax_implications", "projected_roi", "irr_estimate", "npv_estimate", "loan_readiness_score", "eoi_ready", "jurisdiction_laws", "legal_checklist", "recalibration_notes", "risk_assessment", "climate_risk"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const fetchJurisdictionDefaults = async (country: string) => {
  const prompt = `Act as a 2026 Global Property Tax & Legal Expert.
  Using REAL-TIME GLOBALLY AVAILABLE DATA for ${country}, find the current 2026 default values for:
  - Stamp Duty Rate (%)
  - VAT/GST Rate (%)
  - Capital Gains Tax Rate (%)
  - Foreign Ownership Rules
  - Tax Residency Rules
  - Repatriation Rules
  - Property Rights Overview
  - Common Investment Incentives (List up to 3)

  MANDATORY: Use Google Search to ensure these are the LATEST 2026 values.
  
  Provide a JSON response with:
  - default_stamp_duty: number
  - default_vat_gst: number
  - default_cgt: number
  - foreign_ownership: string
  - tax_residency: string
  - repatriation_rules: string
  - property_rights: string
  - common_incentives: array of objects with { name: string, description: string }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            default_stamp_duty: { type: Type.NUMBER },
            default_vat_gst: { type: Type.NUMBER },
            default_cgt: { type: Type.NUMBER },
            foreign_ownership: { type: Type.STRING },
            tax_residency: { type: Type.STRING },
            repatriation_rules: { type: Type.STRING },
            property_rights: { type: Type.STRING },
            common_incentives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            }
          },
          required: ["default_stamp_duty", "default_vat_gst", "default_cgt", "foreign_ownership", "tax_residency", "repatriation_rules", "property_rights", "common_incentives"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Defaults Error:", error);
    return null;
  }
};

export const marketInsights = async (country: string) => {
  const prompt = `Act as a 2026 Global Property Market Analyst.
  Using REAL-TIME GLOBALLY AVAILABLE DATA for ${country}, provide a comprehensive market insight report.
  
  MANDATORY: Use Google Search to find the LATEST 2026 market trends, interest rate forecasts, and major infrastructure projects in ${country}.
  
  Provide a JSON response with:
  - market_sentiment: string (Bullish, Bearish, or Neutral with explanation)
  - key_trends: string[] (List of 3-5 major trends)
  - interest_rate_forecast: string (Projected movement for 2026-2027)
  - top_investment_hubs: object[] with { city: string, reason: string, projected_growth: number }
  - risk_factors: string[] (List of 3-5 potential risks)
  - summary: string (Overall executive summary)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            market_sentiment: { type: Type.STRING },
            key_trends: { type: Type.ARRAY, items: { type: Type.STRING } },
            interest_rate_forecast: { type: Type.STRING },
            top_investment_hubs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  city: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  projected_growth: { type: Type.NUMBER }
                },
                required: ["city", "reason", "projected_growth"]
              }
            },
            risk_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["market_sentiment", "key_trends", "interest_rate_forecast", "top_investment_hubs", "risk_factors", "summary"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Market Insights Error:", error);
    return null;
  }
};
export const marketYieldAlerts = async (country: string) => {
  const prompt = `Act as an Elite Global Arbitrage & Investment Scout.
  Using REAL-TIME GLOBALLY AVAILABLE DATA for ${country} (and comparing to global benchmarks), identify 3 hyper-lucrative, time-sensitive property investment opportunities OR fiscal changes (tax breaks, interest rate drops, etc) that create a high-yield window.
  
  MANDATORY: Use Google Search to find the LATEST 2026 news.
  
  Provide a JSON response with an array of objects:
  - id: string (unique)
  - type: string (e.g., 'OPPORTUNITY', 'REGULATORY', 'ARBITRAGE')
  - title: string
  - description: string
  - urgency: string ('HIGH', 'MEDIUM', 'LOW')
  - projected_yield_boost: string (e.g., '+4.5% ROI')
  - action_label: string (e.g., 'View Analysis', 'Draft EOI')`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              urgency: { type: Type.STRING },
              projected_yield_boost: { type: Type.STRING },
              action_label: { type: Type.STRING }
            },
            required: ["id", "type", "title", "description", "urgency", "projected_yield_boost", "action_label"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Yield Alerts Error:", error);
    return [];
  }
};

export const lawGPT = async (country: string, topic: string) => {
  const prompt = `Act as a 2026 Senior Jurisdictional Attorney and Fiscal Strategist.
  Perform a deep-dive legal analysis for ${country} regarding the following topic: ${topic}.
  
  MANDATORY: Use Google Search to find high-fidelity legal texts, recent supreme court/high court rulings (2025-2026), and specific clause references from the Land Acts and Tax Codes of ${country}.
  
  Provide a JSON response with:
  - primary_statutes: string[] (Specific Acts/Laws identified)
  - legal_interpretation: string (Your expert synthesis)
  - precedents: object[] with { case_name: string, year: number, summary: string }
  - compliance_checklist: string[]
  - strategic_recommendation: string (Executive advice for high-net-worth investors)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary_statutes: { type: Type.ARRAY, items: { type: Type.STRING } },
            legal_interpretation: { type: Type.STRING },
            precedents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  case_name: { type: Type.STRING },
                  year: { type: Type.NUMBER },
                  summary: { type: Type.STRING }
                },
                required: ["case_name", "year", "summary"]
              }
            },
            compliance_checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategic_recommendation: { type: Type.STRING }
          },
          required: ["primary_statutes", "legal_interpretation", "precedents", "compliance_checklist", "strategic_recommendation"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Law-GPT Error:", error);
    return null;
  }
};
