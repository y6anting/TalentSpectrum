export type EmployerCostResult = {
  baseSalary: number;
  epfCost: number;
  socsoCost: number;
  eisCost: number;
  monthlyEmployerCost: number;
  annualCost: number;
  neuroTaxSavings: number;
  okuTaxSavings: number;
  neuroAfterTax: number;
  okuAfterTax: number;
  annualSavings: number;
};

// Fixed rates used in calculations
const FIXED_EPF_RATE = 13; // %
const FIXED_SOCSO_RATE = 1.75; // %
const FIXED_EIS_RATE = 0.2; // %
const FIXED_CORPORATE_TAX_RATE = 24; // %

export function calculateEmployerCosts(baseSalaryInput: number): EmployerCostResult {
  const baseSalary = Number(baseSalaryInput) || 0;

  const epfCost = (baseSalary * FIXED_EPF_RATE) / 100;
  const socsoCost = (baseSalary * FIXED_SOCSO_RATE) / 100;
  const eisCost = (baseSalary * FIXED_EIS_RATE) / 100;

  const monthlyEmployerCost = baseSalary + epfCost + socsoCost + eisCost;
  const annualCost = monthlyEmployerCost * 12;

  // Neurodivergent: normal deduction; OKU: double deduction
  const neuroDeductible = annualCost;
  const okuDeductible = annualCost * 2;

  const neuroTaxSavings = (neuroDeductible * FIXED_CORPORATE_TAX_RATE) / 100;
  const okuTaxSavings = (okuDeductible * FIXED_CORPORATE_TAX_RATE) / 100;

  const neuroAfterTax = annualCost - neuroTaxSavings;
  const okuAfterTax = annualCost - okuTaxSavings;
  const annualSavings = neuroAfterTax - okuAfterTax;

  return {
    baseSalary,
    epfCost,
    socsoCost,
    eisCost,
    monthlyEmployerCost,
    annualCost,
    neuroTaxSavings,
    okuTaxSavings,
    neuroAfterTax,
    okuAfterTax,
    annualSavings,
  };
}