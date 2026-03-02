package com.invoicer.service

import com.invoicer.dto.CreateInvoiceRequest
import com.invoicer.dto.LineItemRequest
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class InvoicePdfService {

    private val dateFormatter = DateTimeFormatter.ofPattern("d MMM yyyy")

    private val currencySymbols = mapOf(
        "USD" to "$", "GHS" to "GH₵", "EUR" to "€", "GBP" to "£",
        "NGN" to "₦", "KES" to "KSh", "ZAR" to "R", "CAD" to "C$", "AUD" to "A$"
    )

    fun generatePdf(request: CreateInvoiceRequest): ByteArray {
        val html = buildTemplateHtml(request)

        val doc: Document = Jsoup.parse(html)
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml).charset("UTF-8")

        val xhtml = doc.html()

        return ByteArrayOutputStream().use { os ->
            PdfRendererBuilder()
                .useFastMode()
                .withHtmlContent(xhtml, null)
                .toStream(os)
                .run()
            os.toByteArray()
        }
    }

    private fun buildTemplateHtml(req: CreateInvoiceRequest): String {
        val items = req.lineItems.map { li ->
            ItemData(li.description, li.quantity, li.rate, li.rate.multiply(BigDecimal.valueOf(li.quantity.toLong())))
        }
        val subtotal = items.fold(BigDecimal.ZERO) { acc, it -> acc.add(it.amount) }
        val discountAmount = req.discount?.let { BigDecimal.valueOf(it) } ?: BigDecimal.ZERO
        val taxableAmount = subtotal.subtract(discountAmount)
        val taxAmount = req.taxRate?.let {
            taxableAmount.multiply(BigDecimal.valueOf(it)).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        } ?: BigDecimal.ZERO
        val total = subtotal.subtract(discountAmount).add(taxAmount)
        val cur = req.currency
        val color = req.primaryColor
        val phone = req.phone

        val d = TemplateData(
            companyName = req.companyName,
            companyLogo = req.companyLogo,
            companyEmail = req.companyEmail,
            address = req.address,
            city = req.city,
            zipCode = req.zipCode,
            country = req.country,
            phone = phone,
            invoiceNumber = req.invoiceNumber,
            invoiceDate = req.invoiceDate,
            dueDate = req.dueDate,
            color = color,
            currency = cur,
            clientName = req.clientName,
            clientCompany = req.clientCompany,
            clientEmail = req.clientEmail,
            clientAddress = req.clientAddress,
            clientCity = req.clientCity,
            clientZip = req.clientZip,
            clientCountry = req.clientCountry,
            notes = req.notes,
            authorizedSignature = req.authorizedSignature,
            taxRate = req.taxRate,
            items = items,
            subtotal = subtotal,
            discountAmount = discountAmount,
            taxAmount = taxAmount,
            total = total
        )

        val body = when (req.templateId) {
            "classic" -> classicTemplate(d)
            "enterprise" -> enterpriseTemplate(d)
            "freelancer" -> freelancerTemplate(d)
            "corporate" -> corporateTemplate(d)
            else -> modernTemplate(d)
        }

        val fontFamily = when (req.fontFamily) {
            "Georgia" -> "'Georgia', serif"
            "Courier New" -> "'Courier New', monospace"
            else -> "'Helvetica', 'Arial', sans-serif"
        }

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <style>
                @page { size: A4; margin: 20mm; }
                body {
                    margin: 0; padding: 0;
                    font-family: $fontFamily;
                    color: #1a1a1a;
                    font-size: 14px;
                    line-height: 1.5;
                    background: #fff;
                }
                table { border-collapse: collapse; }
                img { max-width: 100%; }
            </style>
        </head>
        <body>
            <div style="max-width: 680px; margin: 0 auto;">
                $body
            </div>
        </body>
        </html>
        """.trimIndent()
    }

    // ── Modern Template ──────────────────────────────────────────────────────

    private fun modernTemplate(d: TemplateData): String {
        val contactParts = listOfNotNull(d.phone.takeIf { it.isNotBlank() }, d.companyEmail).joinToString(" · ")

        return """
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
            <div style="padding-top: 8px;">
                ${logoImg(d.companyLogo, "56px", "160px")}
            </div>
            <div style="text-align: right;">
                <div style="font-size: 36px; font-weight: 300; letter-spacing: 0.025em; color: ${esc(d.color)}; margin-bottom: 12px;">Invoice</div>
                <div style="font-size: 14px; color: #1f2937; font-weight: 600;">${esc(d.companyName)}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                    ${addressBlock(d.address, d.city, d.zipCode, d.country)}
                    ${if (contactParts.isNotBlank()) "<div>$contactParts</div>" else ""}
                </div>
            </div>
        </div>

        <!-- Bill To Banner -->
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px 24px; margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px;">Bill To</div>
                    ${clientBlock(d)}
                </div>
                <div style="text-align: right; font-size: 14px;">
                    ${invoiceMeta(d)}
                </div>
            </div>
        </div>

        <!-- Line Items -->
        ${lineItemsTable(d, "Item", "Qty", "Price", "Amount",
            headerStyle = "border-bottom: 2px solid #e5e7eb; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: #9ca3af; text-transform: uppercase;",
            rowBorder = "border-bottom: 1px solid #f3f4f6;"
        )}

        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="max-width: 320px;">
                ${notesBlock(d.notes)}
            </div>
            <div style="width: 224px;">
                ${totalsBlock(d)}
                <!-- Amount Due Box -->
                <div style="margin-top: 16px; border-radius: 8px; padding: 12px 16px; border: 1px solid #e5e7eb; border-top: 3px solid ${esc(d.color)};">
                    <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">Amount Due</div>
                    <div style="font-size: 20px; font-weight: 700; color: #111827;">${money(d.total, d.currency)}</div>
                </div>
            </div>
        </div>
        """.trimIndent()
    }

    // ── Classic Template ─────────────────────────────────────────────────────

    private fun classicTemplate(d: TemplateData): String {
        val contactParts = listOfNotNull(d.phone.takeIf { it.isNotBlank() }, d.companyEmail).joinToString(" · ")

        return """
        <div style="font-family: 'Georgia', 'Times New Roman', serif;">
            <!-- Centered Header -->
            <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px double ${esc(d.color)};">
                ${if (!d.companyLogo.isNullOrBlank()) "<div style=\"margin-bottom: 12px;\">${logoImg(d.companyLogo, "56px", "160px", center = true)}</div>" else ""}
                <h1 style="font-size: 30px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${esc(d.color)}; margin: 0 0 8px 0;">INVOICE</h1>
                <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${esc(d.companyName)}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                    ${addressBlock(d.address, d.city, d.zipCode, d.country)}
                    ${if (contactParts.isNotBlank()) "<div>$contactParts</div>" else ""}
                </div>
            </div>

            <!-- Bill To + Invoice Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
                <div>
                    <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">Bill To</div>
                    ${clientBlock(d)}
                </div>
                <div style="text-align: right; font-size: 14px;">
                    ${if (d.invoiceNumber.isNotBlank()) "<div><span style=\"color: #6b7280; font-weight: 500;\">Invoice No: </span><span style=\"color: #1f2937; font-weight: 600;\">${esc(d.invoiceNumber)}</span></div>" else ""}
                    <div><span style="color: #6b7280; font-weight: 500;">Date: </span><span style="color: #1f2937;">${fmtDate(d.invoiceDate)}</span></div>
                    <div><span style="color: #6b7280; font-weight: 500;">Due: </span><span style="color: #1f2937;">${fmtDate(d.dueDate)}</span></div>
                </div>
            </div>

            <!-- Line Items -->
            ${lineItemsTable(d, "Description", "Qty", "Rate", "Amount",
                headerStyle = "border-top: 2px solid ${esc(d.color)}; border-bottom: 2px solid ${esc(d.color)}; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; color: #4b5563; text-transform: uppercase;",
                rowBorder = "border-bottom: 1px solid #e5e7eb;",
                footerBorder = "border-top: 2px solid ${esc(d.color)};"
            )}

            <!-- Footer -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="max-width: 320px;">
                    ${notesBlock(d.notes, italic = true)}
                </div>
                <div style="width: 224px;">
                    ${totalsBlock(d, showTotalBorder = false)}
                    <div style="margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; border-top: 2px solid ${esc(d.color)};">
                        <span style="color: #374151;">Total Due</span>
                        <span style="color: ${esc(d.color)};">${money(d.total, d.currency)}</span>
                    </div>
                </div>
            </div>
        </div>
        """.trimIndent()
    }

    // ── Enterprise Template ──────────────────────────────────────────────────

    private fun enterpriseTemplate(d: TemplateData): String {
        val contactParts = listOfNotNull(d.phone.takeIf { it.isNotBlank() }, d.companyEmail).joinToString(" · ")

        return """
        <!-- Top Banner -->
        <div style="background: ${esc(d.color)}; border-radius: 8px 8px 0 0; padding: 20px 32px; margin: -20px -20px 32px -20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    ${if (!d.companyLogo.isNullOrBlank()) "<img src=\"${esc(d.companyLogo)}\" style=\"max-height: 48px; max-width: 140px; filter: brightness(0) invert(1);\" />" else ""}
                    <div style="color: #fff;">
                        <div style="font-size: 18px; font-weight: 700;">${esc(d.companyName)}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 2px;">${esc(contactParts)}</div>
                    </div>
                </div>
                <div style="color: #fff; text-align: right;">
                    <div style="font-size: 24px; font-weight: 300; letter-spacing: 0.05em;">INVOICE</div>
                    ${if (d.invoiceNumber.isNotBlank()) "<div style=\"color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 2px;\">#${esc(d.invoiceNumber)}</div>" else ""}
                </div>
            </div>
        </div>

        <!-- Bill To + Company Address -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
            <div>
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${esc(d.color)}; margin-bottom: 8px;">Bill To</div>
                ${clientBlock(d)}
            </div>
            <div style="text-align: right;">
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${esc(d.color)}; margin-bottom: 8px;">Company Address</div>
                <div style="font-size: 12px; color: #6b7280;">
                    ${addressBlock(d.address, d.city, d.zipCode, d.country)}
                </div>
                <div style="margin-top: 12px; font-size: 14px; color: #4b5563;">
                    <div><span style="color: #9ca3af; font-size: 12px;">Date: </span>${fmtDate(d.invoiceDate)}</div>
                    <div><span style="color: #9ca3af; font-size: 12px;">Due: </span>${fmtDate(d.dueDate)}</div>
                </div>
            </div>
        </div>

        <!-- Line Items -->
        ${lineItemsTable(d, "Item", "Qty", "Price", "Amount",
            headerStyle = "background: ${esc(d.color)}; color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;",
            headerPad = "padding: 10px 12px;",
            cellPad = "padding: 12px;",
            rowBorder = "border-bottom: 1px solid #f3f4f6;",
            altRowBg = true
        )}

        <!-- Amount in Words -->
        <div style="margin-bottom: 24px; padding: 12px 16px; border-radius: 8px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">Amount in Words</div>
            <div style="font-size: 14px; color: #374151; font-weight: 500; font-style: italic;">${numberToWords(d.total)} ${esc(d.currency)}</div>
        </div>

        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="max-width: 320px;">
                ${notesBlock(d.notes)}
                <!-- Signature -->
                <div style="margin-top: 32px; padding-top: 16px;">
                    <div style="border-top: 1px solid #d1d5db; width: 192px; padding-top: 8px;">
                        <div style="font-size: 12px; color: #6b7280;">${esc(d.authorizedSignature ?: "Authorized Signature")}</div>
                    </div>
                </div>
            </div>
            <div style="width: 224px;">
                ${totalsBlock(d, borderColor = d.color)}
            </div>
        </div>
        """.trimIndent()
    }

    // ── Freelancer Template ──────────────────────────────────────────────────

    private fun freelancerTemplate(d: TemplateData): String {
        val contactParts = listOfNotNull(d.phone.takeIf { it.isNotBlank() }, d.companyEmail).joinToString(" · ")

        return """
        <div style="display: flex;">
            <!-- Left accent bar -->
            <div style="width: 6px; background: ${esc(d.color)}; border-radius: 4px 0 0 4px; margin-right: 32px; flex-shrink: 0;"></div>

            <div style="flex: 1;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                            ${if (!d.companyLogo.isNullOrBlank()) "<img src=\"${esc(d.companyLogo)}\" style=\"max-height: 40px; max-width: 120px;\" />" else ""}
                            <div style="font-size: 20px; font-weight: 700; color: #1f2937;">${esc(d.companyName)}</div>
                        </div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            ${addressBlock(d.address, d.city, d.zipCode, d.country)}
                            ${if (contactParts.isNotBlank()) "<div>$contactParts</div>" else ""}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 30px; font-weight: 800; color: ${esc(d.color)};">Invoice</div>
                        ${if (d.invoiceNumber.isNotBlank()) "<div style=\"font-size: 14px; color: #6b7280; margin-top: 4px;\">#${esc(d.invoiceNumber)}</div>" else ""}
                    </div>
                </div>

                <!-- Info Cards -->
                <div style="display: flex; gap: 16px; margin-bottom: 32px;">
                    <div style="flex: 1; border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px;">
                        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${esc(d.color)}; margin-bottom: 8px;">Bill To</div>
                        ${clientBlock(d)}
                    </div>
                    <div style="flex: 1; border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px;">
                        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${esc(d.color)}; margin-bottom: 8px;">Details</div>
                        <div style="font-size: 14px;">
                            <div style="margin-bottom: 8px;">
                                <div style="color: #9ca3af; font-size: 12px;">Issue Date</div>
                                <div style="color: #1f2937; font-weight: 500;">${fmtDate(d.invoiceDate)}</div>
                            </div>
                            <div>
                                <div style="color: #9ca3af; font-size: 12px;">Due Date</div>
                                <div style="color: #1f2937; font-weight: 500;">${fmtDate(d.dueDate)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Line Items -->
                ${lineItemsTable(d, "Item", "Qty", "Price", "Amount",
                    headerStyle = "background: ${esc(d.color)}15; color: ${esc(d.color)}; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;",
                    headerPad = "padding: 10px 12px;",
                    cellPad = "padding: 12px;",
                    rowBorder = "border-bottom: 1px solid #f3f4f6;"
                )}

                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="max-width: 300px;">
                        ${if (!d.notes.isNullOrBlank()) """
                        <div style="border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px;">
                            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${esc(d.color)}; margin-bottom: 6px;">Notes</div>
                            <p style="font-size: 12px; color: #6b7280; white-space: pre-line; margin: 0;">${esc(d.notes!!)}</p>
                        </div>
                        """ else ""}
                    </div>
                    <div style="width: 224px;">
                        ${totalsBlock(d, showTotalBorder = false)}
                        <!-- Amount Due callout -->
                        <div style="margin-top: 16px; border-radius: 12px; padding: 16px 20px; color: #fff; background: ${esc(d.color)};">
                            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; margin-bottom: 4px;">Amount Due</div>
                            <div style="font-size: 24px; font-weight: 800;">${money(d.total, d.currency)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        """.trimIndent()
    }

    // ── Corporate Template ───────────────────────────────────────────────────

    private fun corporateTemplate(d: TemplateData): String {
        val contactParts = listOfNotNull(d.phone.takeIf { it.isNotBlank() }, d.companyEmail).joinToString(" · ")

        return """
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
            <div>
                ${if (!d.companyLogo.isNullOrBlank()) "<div style=\"margin-bottom: 8px;\">${logoImg(d.companyLogo, "56px", "160px")}</div>" else ""}
                <div style="font-size: 18px; font-weight: 700; color: #1f2937;">${esc(d.companyName)}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                    ${addressBlock(d.address, d.city, d.zipCode, d.country)}
                    ${if (contactParts.isNotBlank()) "<div>$contactParts</div>" else ""}
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: ${esc(d.color)}; margin-bottom: 8px;">INVOICE</div>
                <div style="width: 100%; height: 2px; background: ${esc(d.color)}; margin-bottom: 12px;"></div>
                <div style="font-size: 14px;">
                    ${if (d.invoiceNumber.isNotBlank()) "<div style=\"display: flex; justify-content: flex-end; gap: 16px;\"><span style=\"color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;\">No.</span><span style=\"color: #1f2937; font-weight: 600; min-width: 100px; text-align: right;\">${esc(d.invoiceNumber)}</span></div>" else ""}
                    <div style="display: flex; justify-content: flex-end; gap: 16px;"><span style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Date</span><span style="color: #1f2937; min-width: 100px; text-align: right;">${fmtDate(d.invoiceDate)}</span></div>
                    <div style="display: flex; justify-content: flex-end; gap: 16px;"><span style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Due</span><span style="color: #1f2937; min-width: 100px; text-align: right;">${fmtDate(d.dueDate)}</span></div>
                </div>
            </div>
        </div>

        <!-- Bill To -->
        <div style="margin-bottom: 32px; border-left: 4px solid ${esc(d.color)}; padding-left: 16px; padding-top: 12px; padding-bottom: 12px;">
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px;">Bill To</div>
            ${clientBlock(d)}
        </div>

        <!-- Line Items -->
        ${lineItemsTable(d, "Description", "Qty", "Unit Price", "Amount",
            headerStyle = "border-top: 2px solid ${esc(d.color)}; border-bottom: 2px solid ${esc(d.color)}; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; color: #4b5563; text-transform: uppercase;",
            rowBorder = "border-bottom: 1px solid #f3f4f6;"
        )}

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
            <div style="width: 256px;">
                ${totalsBlock(d, borderColor = d.color)}
            </div>
        </div>

        <!-- Amount in Words -->
        <div style="margin-bottom: 24px; padding: 8px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
            <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Amount in Words</div>
            <div style="font-size: 14px; color: #374151; font-weight: 500;">${numberToWords(d.total)} ${esc(d.currency)}</div>
        </div>

        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="max-width: 320px;">
                ${notesBlock(d.notes)}
            </div>
            <!-- Signature -->
            <div style="text-align: center; width: 208px;">
                <div style="border-top: 2px solid #d1d5db; padding-top: 8px; margin-top: 16px;">
                    <div style="font-size: 14px; color: #374151; font-weight: 500;">${esc(d.authorizedSignature ?: "Authorized Signature")}</div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">${esc(d.companyName)}</div>
                </div>
            </div>
        </div>
        """.trimIndent()
    }

    // ── Shared Helpers ───────────────────────────────────────────────────────

    private fun logoImg(logo: String?, maxH: String, maxW: String, center: Boolean = false): String {
        if (logo.isNullOrBlank()) return "<div style=\"width: 56px; height: 56px; border-radius: 8px; background: #f3f4f6;\"></div>"
        val align = if (center) "margin: 0 auto; display: block;" else ""
        return "<img src=\"${esc(logo)}\" style=\"max-height: $maxH; max-width: $maxW; $align\" />"
    }

    private fun addressBlock(address: String, city: String, zipCode: String, country: String): String {
        val parts = mutableListOf<String>()
        if (address.isNotBlank()) parts.add("<div>${esc(address)}</div>")
        val cityZip = listOf(city, zipCode).filter { it.isNotBlank() }.joinToString(", ")
        if (cityZip.isNotBlank()) parts.add("<div>${esc(cityZip)}</div>")
        if (country.isNotBlank()) parts.add("<div>${esc(country)}</div>")
        return parts.joinToString("")
    }

    private fun clientBlock(d: TemplateData): String {
        val parts = mutableListOf<String>()
        d.clientName?.takeIf { it.isNotBlank() }?.let { parts.add("<div style=\"font-weight: 600; color: #1f2937; font-size: 14px;\">${esc(it)}</div>") }
        d.clientCompany?.takeIf { it.isNotBlank() }?.let { parts.add("<div style=\"color: #4b5563; font-size: 14px;\">${esc(it)}</div>") }
        d.clientEmail?.takeIf { it.isNotBlank() }?.let { parts.add("<div style=\"color: #6b7280; font-size: 14px;\">${esc(it)}</div>") }
        d.clientAddress?.takeIf { it.isNotBlank() }?.let { parts.add("<div style=\"color: #6b7280; font-size: 14px;\">${esc(it)}</div>") }
        val loc = listOfNotNull(d.clientCity, d.clientZip, d.clientCountry).filter { it.isNotBlank() }.joinToString(", ")
        if (loc.isNotBlank()) parts.add("<div style=\"color: #6b7280; font-size: 14px;\">${esc(loc)}</div>")
        if (parts.isEmpty()) parts.add("<div style=\"color: #9ca3af; font-style: italic; font-size: 14px;\">No client info</div>")
        return parts.joinToString("")
    }

    private fun invoiceMeta(d: TemplateData): String {
        val parts = mutableListOf<String>()
        if (d.invoiceNumber.isNotBlank()) {
            parts.add("""
                <div style="margin-bottom: 8px;">
                    <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase;">Invoice #</div>
                    <div style="color: #1f2937; font-weight: 500;">${esc(d.invoiceNumber)}</div>
                </div>
            """.trimIndent())
        }
        parts.add("""
            <div style="margin-bottom: 8px;">
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase;">Date</div>
                <div style="color: #1f2937;">${fmtDate(d.invoiceDate)}</div>
            </div>
            <div>
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase;">Due Date</div>
                <div style="color: #1f2937;">${fmtDate(d.dueDate)}</div>
            </div>
        """.trimIndent())
        return parts.joinToString("")
    }

    private fun lineItemsTable(
        d: TemplateData,
        col1: String, col2: String, col3: String, col4: String,
        headerStyle: String = "",
        headerPad: String = "padding: 10px 0;",
        cellPad: String = "padding: 12px 0;",
        rowBorder: String = "",
        footerBorder: String = "",
        altRowBg: Boolean = false
    ): String {
        val rows = d.items.mapIndexed { i, item ->
            val bg = if (altRowBg && i % 2 == 0) "background: #fafafa;" else ""
            """<tr style="$rowBorder $bg">
                <td style="$cellPad color: #1f2937;">${esc(item.description)}</td>
                <td style="$cellPad text-align: center; color: #4b5563;">${item.quantity}</td>
                <td style="$cellPad text-align: right; color: #4b5563;">${money(item.rate, d.currency)}</td>
                <td style="$cellPad text-align: right; color: #1f2937; font-weight: 500;">${money(item.amount, d.currency)}</td>
            </tr>"""
        }.joinToString("")

        val footer = if (footerBorder.isNotBlank()) "<tfoot><tr style=\"$footerBorder\"><td colspan=\"4\"></td></tr></tfoot>" else ""

        return """
        <table style="width: 100%; margin-bottom: 32px; font-size: 14px;">
            <thead>
                <tr style="$headerStyle">
                    <th style="text-align: left; $headerPad">$col1</th>
                    <th style="text-align: center; width: 64px; $headerPad">$col2</th>
                    <th style="text-align: right; width: 112px; $headerPad">$col3</th>
                    <th style="text-align: right; width: 112px; $headerPad">$col4</th>
                </tr>
            </thead>
            <tbody>$rows</tbody>
            $footer
        </table>
        """.trimIndent()
    }

    private fun totalsBlock(d: TemplateData, borderColor: String? = null, showTotalBorder: Boolean = true): String {
        val bc = borderColor ?: "#e5e7eb"
        val parts = mutableListOf<String>()
        parts.add(totalRow("Subtotal", money(d.subtotal, d.currency)))
        if (d.discountAmount > BigDecimal.ZERO) {
            parts.add(totalRow("Discount", "-${money(d.discountAmount, d.currency)}"))
        }
        if ((d.taxRate ?: 0.0) > 0) {
            parts.add(totalRow("Tax (${d.taxRate}%)", money(d.taxAmount, d.currency)))
        }
        if (showTotalBorder) {
            parts.add("""
                <div style="border-top: 2px solid $bc; padding-top: 8px; margin-top: 4px;">
                    <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px;">
                        <span style="color: #374151;">Total</span>
                        <span style="color: ${borderColor ?: "#111827"};">${money(d.total, d.currency)}</span>
                    </div>
                </div>
            """.trimIndent())
        }
        return parts.joinToString("")
    }

    private fun totalRow(label: String, value: String): String {
        return """<div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span style="color: #6b7280;">$label</span>
            <span style="color: #1f2937;">$value</span>
        </div>"""
    }

    private fun notesBlock(notes: String?, italic: Boolean = false): String {
        if (notes.isNullOrBlank()) return ""
        val style = if (italic) "font-style: italic;" else ""
        return """
            <div>
                <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px;">Notes / Terms</div>
                <p style="font-size: 12px; color: #6b7280; white-space: pre-line; margin: 0; $style">${esc(notes)}</p>
            </div>
        """.trimIndent()
    }

    private fun money(amount: BigDecimal, currencyCode: String): String {
        val symbol = currencySymbols[currencyCode] ?: currencyCode
        return "$symbol${String.format("%,.2f", amount)}"
    }

    private fun fmtDate(date: LocalDate): String = date.format(dateFormatter)

    private fun esc(text: String): String = text
        .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        .replace("\"", "&quot;").replace("'", "&#39;")

    // ── Number to Words ──────────────────────────────────────────────────────

    private fun numberToWords(amount: BigDecimal): String {
        val abs = amount.abs()
        val whole = abs.toLong()
        val cents = abs.remainder(BigDecimal.ONE).multiply(BigDecimal(100)).setScale(0, RoundingMode.HALF_UP).toInt()

        if (whole == 0L && cents == 0) return "Zero"
        if (whole > 999_999_999) return String.format("%,d", whole)

        val parts = mutableListOf<String>()
        val millions = (whole / 1_000_000).toInt()
        val thousands = ((whole % 1_000_000) / 1_000).toInt()
        val hundreds = (whole % 1_000).toInt()

        if (millions > 0) parts.add("${convertHundreds(millions)} Million")
        if (thousands > 0) parts.add("${convertHundreds(thousands)} Thousand")
        if (hundreds > 0) parts.add(convertHundreds(hundreds))

        var result = parts.joinToString(", ")
        if (cents > 0) result += " and ${cents.toString().padStart(2, '0')}/100"
        return result
    }

    private fun convertHundreds(n: Int): String {
        if (n == 0) return ""
        if (n < 20) return ONES[n]
        if (n < 100) {
            val ten = n / 10
            val one = n % 10
            return TENS[ten] + if (one > 0) "-${ONES[one]}" else ""
        }
        val h = n / 100
        val rem = n % 100
        return ONES[h] + " Hundred" + if (rem > 0) " and ${convertHundreds(rem)}" else ""
    }

    companion object {
        private val ONES = arrayOf(
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"
        )
        private val TENS = arrayOf(
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
        )
    }

    private data class ItemData(val description: String, val quantity: Int, val rate: BigDecimal, val amount: BigDecimal)

    private data class TemplateData(
        val companyName: String, val companyLogo: String?, val companyEmail: String,
        val address: String, val city: String, val zipCode: String, val country: String, val phone: String,
        val invoiceNumber: String, val invoiceDate: LocalDate, val dueDate: LocalDate,
        val color: String, val currency: String,
        val clientName: String?, val clientCompany: String?, val clientEmail: String?,
        val clientAddress: String?, val clientCity: String?, val clientZip: String?, val clientCountry: String?,
        val notes: String?, val authorizedSignature: String?, val taxRate: Double?,
        val items: List<ItemData>,
        val subtotal: BigDecimal, val discountAmount: BigDecimal, val taxAmount: BigDecimal, val total: BigDecimal
    )
}
