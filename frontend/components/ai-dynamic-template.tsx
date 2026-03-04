"use client";

import { formatMoney } from "@/lib/currency";
import type { AiInvoiceAnalysis } from "@/lib/types";

export interface AiInvoiceFormData {
  companyName: string;
  companyLogo?: string | null;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  companyEmail?: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCity?: string;
  clientZip?: string;
  clientCountry?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  lineItems: { id: string; description: string; quantity: number; rate: number; amount: number }[];
  taxRate?: number;
  discount?: number;
  notes?: string;
  currency: string;
  authorizedSignature?: string | null;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getFontFamily(font: string): string {
  switch (font) {
    case "serif": return "Georgia, 'Times New Roman', Times, serif";
    case "monospace": return "'Courier New', Courier, monospace";
    default: return "'Segoe UI', system-ui, -apple-system, sans-serif";
  }
}

function getBorderRadius(radius: string): string {
  switch (radius) {
    case "small": return "4px";
    case "medium": return "8px";
    case "large": return "12px";
    default: return "0";
  }
}

function getHeadingSize(size: string): string {
  switch (size) {
    case "large": return "2.25rem";
    case "small": return "1.25rem";
    default: return "1.75rem";
  }
}

function getCellPadding(padding: string): string {
  switch (padding) {
    case "compact": return "6px 8px";
    case "spacious": return "14px 12px";
    default: return "10px 10px";
  }
}

export function AiDynamicTemplate({
  analysis,
  data,
}: {
  analysis: AiInvoiceAnalysis;
  data: AiInvoiceFormData;
}) {
  const { layout, typography, tableStyle, specialFeatures } = analysis;
  const colors = layout.colorScheme;
  const br = getBorderRadius(specialFeatures.borderRadius);

  const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = data.discount ? (subtotal * data.discount) / 100 : 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = data.taxRate ? (afterDiscount * data.taxRate) / 100 : 0;
  const total = afterDiscount + taxAmount;
  const currency = data.currency;

  const headingFont = getFontFamily(typography.headingFont);
  const bodyFont = getFontFamily(typography.bodyFont);
  const headingSize = getHeadingSize(typography.headingSize);

  return (
    <div
      style={{
        fontFamily: bodyFont,
        color: colors.text,
        backgroundColor: colors.background,
        padding: "40px",
        minHeight: "1000px",
      }}
    >
      {/* Header Bar */}
      {layout.hasHeaderBar && (
        <div
          style={{
            backgroundColor: layout.headerBarColor || colors.primary,
            height: "8px",
            marginBottom: "32px",
            marginTop: "-40px",
            marginLeft: "-40px",
            marginRight: "-40px",
            borderRadius: br !== "0" ? `${br} ${br} 0 0` : undefined,
          }}
        />
      )}

      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: layout.logoPosition === "right" ? "flex-end" : layout.logoPosition === "center" ? "center" : "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
          flexDirection: layout.logoPosition === "right" ? "row-reverse" : "row",
        }}
      >
        {/* Logo / Company */}
        <div style={{ textAlign: layout.logoPosition === "center" ? "center" : "left" }}>
          {data.companyLogo ? (
            <img
              src={data.companyLogo}
              alt="Logo"
              style={{ maxHeight: "56px", maxWidth: "160px", width: "auto", height: "auto", marginBottom: "8px" }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: br,
                backgroundColor: colors.primary + "20",
                marginBottom: "8px",
              }}
            />
          )}
          <div style={{ fontFamily: headingFont, fontWeight: typography.headingWeight === "light" ? 300 : typography.headingWeight === "bold" ? 700 : 400, fontSize: "14px", color: colors.text }}>
            {data.companyName || "Your Company"}
          </div>
          <div style={{ fontSize: "11px", color: colors.secondary, lineHeight: 1.6, marginTop: "4px" }}>
            {data.address && <div>{data.address}</div>}
            {(data.city || data.zipCode) && <div>{[data.city, data.zipCode].filter(Boolean).join(", ")}</div>}
            {data.country && <div>{data.country}</div>}
            {(data.phone || data.companyEmail) && <div>{[data.phone, data.companyEmail].filter(Boolean).join(" · ")}</div>}
          </div>
        </div>

        {/* Invoice Title */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: headingFont,
              fontSize: headingSize,
              fontWeight: typography.headingWeight === "bold" ? 700 : typography.headingWeight === "light" ? 300 : 400,
              color: colors.primary,
              textTransform: typography.uppercase ? "uppercase" : "none",
              letterSpacing: typography.uppercase ? "0.1em" : "0.02em",
            }}
          >
            Invoice
          </div>
        </div>
      </div>

      {specialFeatures.hasDividers && (
        <hr style={{ border: "none", borderTop: `1px ${specialFeatures.dividerStyle} ${colors.secondary}40`, margin: "16px 0" }} />
      )}

      {/* Bill To + Invoice Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: colors.secondary,
              marginBottom: "8px",
            }}
          >
            Bill To
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.6 }}>
            {data.clientName && <div style={{ fontWeight: 600 }}>{data.clientName}</div>}
            {data.clientCompany && <div style={{ color: colors.secondary }}>{data.clientCompany}</div>}
            {data.clientEmail && <div style={{ color: colors.secondary }}>{data.clientEmail}</div>}
            {data.clientAddress && <div style={{ color: colors.secondary }}>{data.clientAddress}</div>}
            {(data.clientCity || data.clientZip || data.clientCountry) && (
              <div style={{ color: colors.secondary }}>
                {[data.clientCity, data.clientZip, data.clientCountry].filter(Boolean).join(", ")}
              </div>
            )}
            {!data.clientName && !data.clientEmail && (
              <div style={{ color: colors.secondary, fontStyle: "italic" }}>No client info</div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right", fontSize: "13px" }}>
          {data.invoiceNumber && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.secondary }}>Invoice #</div>
              <div style={{ fontWeight: 500 }}>{data.invoiceNumber}</div>
            </div>
          )}
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.secondary }}>Date</div>
            <div>{formatDate(data.invoiceDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.secondary }}>Due Date</div>
            <div>{formatDate(data.dueDate)}</div>
          </div>
        </div>
      </div>

      {specialFeatures.hasDividers && (
        <hr style={{ border: "none", borderTop: `1px ${specialFeatures.dividerStyle} ${colors.secondary}40`, margin: "16px 0" }} />
      )}

      {/* Line Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "32px",
          fontSize: typography.bodySize === "small" ? "12px" : "13px",
        }}
      >
        <thead>
          {tableStyle.hasHeader && (
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: getCellPadding(tableStyle.cellPadding),
                  backgroundColor: tableStyle.headerBackground,
                  color: tableStyle.headerTextColor,
                  fontWeight: 600,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: tableStyle.hasBorders ? `2px solid ${tableStyle.borderColor}` : "none",
                  borderRadius: br !== "0" ? `${br} 0 0 0` : undefined,
                }}
              >
                Item
              </th>
              <th
                style={{
                  textAlign: "center",
                  width: "60px",
                  padding: getCellPadding(tableStyle.cellPadding),
                  backgroundColor: tableStyle.headerBackground,
                  color: tableStyle.headerTextColor,
                  fontWeight: 600,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: tableStyle.hasBorders ? `2px solid ${tableStyle.borderColor}` : "none",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  textAlign: "right",
                  width: "100px",
                  padding: getCellPadding(tableStyle.cellPadding),
                  backgroundColor: tableStyle.headerBackground,
                  color: tableStyle.headerTextColor,
                  fontWeight: 600,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: tableStyle.hasBorders ? `2px solid ${tableStyle.borderColor}` : "none",
                }}
              >
                Price
              </th>
              <th
                style={{
                  textAlign: "right",
                  width: "100px",
                  padding: getCellPadding(tableStyle.cellPadding),
                  backgroundColor: tableStyle.headerBackground,
                  color: tableStyle.headerTextColor,
                  fontWeight: 600,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: tableStyle.hasBorders ? `2px solid ${tableStyle.borderColor}` : "none",
                  borderRadius: br !== "0" ? `0 ${br} 0 0` : undefined,
                }}
              >
                Amount
              </th>
            </tr>
          )}
        </thead>
        <tbody>
          {data.lineItems.length > 0 ? (
            data.lineItems.map((item, index) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor:
                    tableStyle.hasAlternatingRows && index % 2 === 1
                      ? tableStyle.alternatingRowColor
                      : "transparent",
                }}
              >
                <td
                  style={{
                    padding: getCellPadding(tableStyle.cellPadding),
                    borderBottom: tableStyle.hasBorders ? `1px solid ${tableStyle.borderColor}` : "none",
                  }}
                >
                  {item.description || "\u2014"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: getCellPadding(tableStyle.cellPadding),
                    borderBottom: tableStyle.hasBorders ? `1px solid ${tableStyle.borderColor}` : "none",
                    color: colors.secondary,
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    padding: getCellPadding(tableStyle.cellPadding),
                    borderBottom: tableStyle.hasBorders ? `1px solid ${tableStyle.borderColor}` : "none",
                    color: colors.secondary,
                  }}
                >
                  {formatMoney(item.rate, currency)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    padding: getCellPadding(tableStyle.cellPadding),
                    borderBottom: tableStyle.hasBorders ? `1px solid ${tableStyle.borderColor}` : "none",
                    fontWeight: 500,
                  }}
                >
                  {formatMoney(item.amount, currency)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: colors.secondary,
                  fontStyle: "italic",
                }}
              >
                No items added
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer: Notes + Totals */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Notes */}
        <div style={{ maxWidth: "320px" }}>
          {data.notes && (
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: colors.secondary,
                  marginBottom: "6px",
                }}
              >
                Notes / Terms
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: colors.secondary,
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  margin: 0,
                }}
              >
                {data.notes}
              </p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div style={{ width: "220px" }}>
          <div style={{ fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: colors.secondary }}>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: colors.secondary }}>Discount ({data.discount}%)</span>
                <span>-{formatMoney(discountAmount, currency)}</span>
              </div>
            )}
            {(data.taxRate || 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: colors.secondary }}>Tax ({data.taxRate}%)</span>
                <span>{formatMoney(taxAmount, currency)}</span>
              </div>
            )}

            {specialFeatures.hasDividers && (
              <hr style={{ border: "none", borderTop: `1px ${specialFeatures.dividerStyle} ${colors.secondary}40`, margin: "8px 0" }} />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginBottom: "8px" }}>
              <span>Total</span>
              <span>{formatMoney(total, currency)}</span>
            </div>
          </div>

          {/* Amount Due Box */}
          <div
            style={{
              marginTop: "12px",
              padding: "12px 16px",
              borderRadius: br,
              backgroundColor:
                specialFeatures.amountBoxStyle === "filled"
                  ? (specialFeatures.amountBoxColor || colors.primary) + "15"
                  : "transparent",
              border:
                specialFeatures.amountBoxStyle === "bordered"
                  ? `2px solid ${specialFeatures.amountBoxColor || colors.primary}`
                  : specialFeatures.amountBoxStyle === "filled"
                  ? "none"
                  : `1px solid ${colors.secondary}30`,
              borderTop:
                specialFeatures.amountBoxStyle === "none"
                  ? `3px solid ${colors.primary}`
                  : undefined,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: colors.secondary,
                marginBottom: "4px",
              }}
            >
              Amount Due
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                fontFamily: headingFont,
                color: colors.primary,
              }}
            >
              {formatMoney(total, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Line */}
      {specialFeatures.hasSignatureLine && (
        <div style={{ marginTop: "48px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "200px", textAlign: "center" }}>
            {data.authorizedSignature ? (
              <img
                src={data.authorizedSignature}
                alt="Signature"
                style={{ maxHeight: "48px", maxWidth: "180px", width: "auto", marginBottom: "4px" }}
              />
            ) : (
              <div style={{ height: "48px" }} />
            )}
            <div style={{ borderTop: `1px solid ${colors.secondary}60`, paddingTop: "8px", fontSize: "11px", color: colors.secondary }}>
              Authorized Signature
            </div>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      {specialFeatures.hasFooterBar && (
        <div
          style={{
            backgroundColor: specialFeatures.footerBarColor || colors.primary,
            height: "8px",
            marginTop: "40px",
            marginBottom: "-40px",
            marginLeft: "-40px",
            marginRight: "-40px",
            borderRadius: br !== "0" ? `0 0 ${br} ${br}` : undefined,
          }}
        />
      )}
    </div>
  );
}
