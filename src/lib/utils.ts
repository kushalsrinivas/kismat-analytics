import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "INR") {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(numAmount);
}

export function formatNumber(num: number | string) {
  const numValue = typeof num === "string" ? parseFloat(num) : num;
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + "M";
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + "K";
  }
  return numValue.toString();
}

export function formatPercentage(percentage: number | string) {
  const numPercentage = typeof percentage === "string" ? parseFloat(percentage) : percentage;
  return `${numPercentage.toFixed(1)}%`;
}

export function getGrowthDirection(current: number, previous: number) {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

export function calculateGrowth(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
