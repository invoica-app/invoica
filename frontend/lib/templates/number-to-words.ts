const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function convertHundreds(n: number): string {
  if (n === 0) return "";

  if (n < 20) return ONES[n];

  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return TENS[ten] + (one ? "-" + ONES[one] : "");
  }

  const hundred = Math.floor(n / 100);
  const remainder = n % 100;
  return ONES[hundred] + " Hundred" + (remainder ? " and " + convertHundreds(remainder) : "");
}

export function numberToWords(amount: number): string {
  if (amount === 0) return "Zero";

  const whole = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - whole) * 100);

  if (whole > 999999999) return whole.toLocaleString();

  const parts: string[] = [];

  const millions = Math.floor(whole / 1000000);
  const thousands = Math.floor((whole % 1000000) / 1000);
  const hundreds = whole % 1000;

  if (millions > 0) parts.push(convertHundreds(millions) + " Million");
  if (thousands > 0) parts.push(convertHundreds(thousands) + " Thousand");
  if (hundreds > 0) parts.push(convertHundreds(hundreds));

  let result = parts.join(", ");
  if (cents > 0) {
    result += ` and ${cents.toString().padStart(2, "0")}/100`;
  }

  return result;
}
