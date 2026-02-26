export const formatAmount = (amount: number, currency: string): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) +
  " " +
  currency;

export const formatDate = (dateStr: string): string =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
