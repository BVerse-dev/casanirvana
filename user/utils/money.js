export const DEFAULT_CURRENCY = {
  code: "GHS",
  symbol: "GH₵",
};

export const resolveCurrencyDisplay = (policy) => ({
  code:
    typeof policy?.defaultCurrencyCode === "string" && policy.defaultCurrencyCode.trim()
      ? policy.defaultCurrencyCode.trim().toUpperCase()
      : DEFAULT_CURRENCY.code,
  symbol:
    typeof policy?.defaultCurrencySymbol === "string" && policy.defaultCurrencySymbol.trim()
      ? policy.defaultCurrencySymbol.trim()
      : DEFAULT_CURRENCY.symbol,
});

export const formatMoney = (amount, policyOrCurrency) => {
  const value = Number(amount);
  const safeAmount = Number.isFinite(value) ? value : 0;
  const currency =
    policyOrCurrency && typeof policyOrCurrency === "object" && "symbol" in policyOrCurrency
      ? policyOrCurrency
      : resolveCurrencyDisplay(policyOrCurrency);

  return `${currency.symbol} ${safeAmount.toFixed(2)}`;
};
