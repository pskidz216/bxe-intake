// Client-side financial calculations (preview only)

// Gross Profit = Revenue - COGS
export function calcGrossProfit(revenue, cogs) {
  const r = parseFloat(revenue) || 0;
  const c = parseFloat(cogs) || 0;
  return r - c;
}

// EBITDA = Gross Profit - OpEx
export function calcEBITDA(grossProfit, opex) {
  const gp = parseFloat(grossProfit) || 0;
  const ox = parseFloat(opex) || 0;
  return gp - ox;
}

// TTM rollup (trailing twelve months from monthly data)
export function calcTTM(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) return null;
  // Take last 12 months that have revenue entered
  const withData = monthlyData.filter(m => m.revenue != null && m.revenue !== '');
  const last12 = withData.slice(-12);
  if (last12.length === 0) return null;

  const sum = (arr, key) => arr.reduce((s, m) => s + (parseFloat(m[key]) || 0), 0);

  const revenue = sum(last12, 'revenue');
  const cogs = sum(last12, 'cogs');
  const grossProfit = revenue - cogs;
  const opex = sum(last12, 'opex');
  const ebitda = grossProfit - opex;

  return {
    revenue,
    cogs,
    grossProfit,
    opex,
    ebitda,
    grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    ebitdaMargin: revenue > 0 ? (ebitda / revenue) * 100 : 0,
  };
}

// 5-year projection from drivers
export function calcProjections(baseRevenue, drivers) {
  const cagr = (parseFloat(drivers.revenue_cagr) || 0) / 100;
  const grossMargin = (parseFloat(drivers.gross_margin_target) || 0) / 100;
  const opexPct = (parseFloat(drivers.opex_pct_revenue) || 0) / 100;
  const daPct = (parseFloat(drivers.da_pct) || 0) / 100;
  const capexPct = (parseFloat(drivers.capex_pct) || 0) / 100;
  const nwcPct = (parseFloat(drivers.nwc_change_pct) || 0) / 100;
  const taxRate = (parseFloat(drivers.tax_rate) || 0) / 100;

  const years = [];
  let rev = parseFloat(baseRevenue) || 0;

  for (let i = 0; i < 5; i++) {
    rev = i === 0 ? rev : rev * (1 + cagr);
    const cogs = rev * (1 - grossMargin);
    const grossProfit = rev - cogs;
    const opex = rev * opexPct;
    const ebitda = grossProfit - opex;
    const da = rev * daPct;
    const ebit = ebitda - da;
    const taxes = Math.max(0, ebit * taxRate);
    const nopat = ebit - taxes;
    const capex = rev * capexPct;
    const nwcChange = rev * nwcPct;
    const fcf = nopat + da - capex - nwcChange;

    years.push({
      year: i + 1,
      revenue: Math.round(rev),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      opex: Math.round(opex),
      ebitda: Math.round(ebitda),
      da: Math.round(da),
      capex: Math.round(capex),
      nwcChange: Math.round(nwcChange),
      fcf: Math.round(fcf),
    });
  }

  return years;
}

// Cap table calculations
export function calcCapTable(inputs) {
  const common = parseFloat(inputs.common_shares) || 0;
  const options = parseFloat(inputs.options_outstanding) || 0;
  const pool = parseFloat(inputs.option_pool_authorized) || 0;
  const warrants = parseFloat(inputs.warrants) || 0;
  const safeConversion = parseFloat(inputs.safe_note_conversion_shares) || 0;
  const preMoney = parseFloat(inputs.pre_money_valuation) || 0;
  const investment = parseFloat(inputs.investment_amount) || 0;

  const fullyDiluted = common + options + pool + warrants + safeConversion;
  const pricePerShare = fullyDiluted > 0 ? preMoney / fullyDiluted : 0;
  const newShares = pricePerShare > 0 ? investment / pricePerShare : 0;
  const postMoney = preMoney + investment;
  const investorOwnership = postMoney > 0 ? (investment / postMoney) * 100 : 0;

  return {
    fullyDiluted: Math.round(fullyDiluted),
    pricePerShare: Math.round(pricePerShare * 100) / 100,
    newShares: Math.round(newShares),
    postMoney: Math.round(postMoney),
    investorOwnership: Math.round(investorOwnership * 100) / 100,
  };
}

// DCF valuation
export function calcDCF(fcfArray, wacc, terminalGrowth) {
  const r = (parseFloat(wacc) || 0) / 100;
  const g = (parseFloat(terminalGrowth) || 0) / 100;

  if (r <= 0 || r <= g) return { enterpriseValue: 0, terminalValue: 0 };

  let pvSum = 0;
  fcfArray.forEach((fcf, i) => {
    const discount = Math.pow(1 + r, i + 1);
    pvSum += (parseFloat(fcf) || 0) / discount;
  });

  const lastFcf = parseFloat(fcfArray[fcfArray.length - 1]) || 0;
  const terminalValue = (lastFcf * (1 + g)) / (r - g);
  const pvTerminal = terminalValue / Math.pow(1 + r, fcfArray.length);

  return {
    enterpriseValue: Math.round(pvSum + pvTerminal),
    terminalValue: Math.round(pvTerminal),
  };
}

// Blended valuation from multiple methods
export function calcBlendedValuation(dcfValue, compsValue, precedentValue, weights) {
  const dcfW = (parseFloat(weights.dcf) || 0) / 100;
  const compsW = (parseFloat(weights.comps) || 0) / 100;
  const precW = (parseFloat(weights.precedent) || 0) / 100;

  const dcf = parseFloat(dcfValue) || 0;
  const comps = parseFloat(compsValue) || 0;
  const prec = parseFloat(precedentValue) || 0;

  return Math.round(dcf * dcfW + comps * compsW + prec * precW);
}
