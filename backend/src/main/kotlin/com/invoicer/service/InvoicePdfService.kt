package com.invoicer.service

import com.invoicer.dto.CreateInvoiceRequest
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.io.File
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class InvoicePdfService {

    private val log = LoggerFactory.getLogger(InvoicePdfService::class.java)
    private val dateFormatter = DateTimeFormatter.ofPattern("d MMM yyyy")

    // PDF-safe currency symbols — ₵ (U+20B5) and ₦ (U+20A6) are outside WinAnsi
    private val currencySymbols = mapOf(
        "USD" to "$",
        "GHS" to "GH\u00a2",
        "EUR" to "\u20ac",
        "GBP" to "\u00a3",
        "NGN" to "NGN ",
        "KES" to "KSh",
        "ZAR" to "R",
        "CAD" to "C$",
        "AUD" to "A$"
    )

    fun generatePdf(request: CreateInvoiceRequest): ByteArray {
        val html = buildTemplateHtml(request)

        val doc: Document = Jsoup.parse(html)
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml).charset("UTF-8")
        val xhtml = doc.html()

        return ByteArrayOutputStream().use { os ->
            val builder = PdfRendererBuilder()
                .useFastMode()
                .withHtmlContent(xhtml, null)
                .toStream(os)

            registerFonts(builder)
            builder.run()
            os.toByteArray()
        }
    }

    private fun registerFonts(builder: PdfRendererBuilder) {
        val fontPaths = listOf(
            "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
        )
        for (path in fontPaths) {
            val file = File(path)
            if (file.exists()) {
                builder.useFont(file, "MainFont")
                log.info("Registered PDF font from: {}", path)
                return
            }
        }
        log.warn("No system font found for PDF rendering — currency symbols may not display correctly")
    }

    // ── Build full HTML document ──────────────────────────────────────────────

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

        val d = TemplateData(
            companyName = req.companyName,
            companyLogo = req.companyLogo,
            companyEmail = req.companyEmail,
            address = req.address,
            city = req.city,
            zipCode = req.zipCode,
            country = req.country,
            phone = req.phone,
            invoiceNumber = req.invoiceNumber,
            invoiceDate = req.invoiceDate,
            dueDate = req.dueDate,
            color = req.primaryColor,
            currency = req.currency,
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
            "Georgia" -> "'Georgia', 'MainFont', serif"
            "Courier New" -> "'Courier New', 'MainFont', monospace"
            else -> "'MainFont', 'Helvetica', 'Arial', sans-serif"
        }

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <style>
                @page { size: A4; margin: 15mm 10mm; }
                body {
                    margin: 0; padding: 0;
                    font-family: $fontFamily;
                    color: #1a1a1a;
                    font-size: 14px;
                    line-height: 1.5;
                    background: #fff;
                }
                table { border-collapse: collapse; }
                td, th { vertical-align: top; }
                img { max-width: 100%; }

                /* Layout */
                .row { width: 100%; }
                .row td { vertical-align: top; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }

                /* Typography — matches Tailwind text sizes */
                .text-4xl { font-size: 36px; }
                .text-3xl { font-size: 30px; }
                .text-2xl { font-size: 24px; }
                .text-xl  { font-size: 20px; }
                .text-lg  { font-size: 18px; }
                .text-base { font-size: 16px; }
                .text-sm  { font-size: 14px; }
                .text-xs  { font-size: 12px; }
                .text-10  { font-size: 10px; }

                /* Font weights */
                .font-light { font-weight: 300; }
                .font-medium { font-weight: 500; }
                .font-semibold { font-weight: 600; }
                .font-bold { font-weight: 700; }
                .font-extrabold { font-weight: 800; }

                /* Colors — matches Tailwind gray scale */
                .text-white { color: #ffffff; }
                .text-gray-400 { color: #9ca3af; }
                .text-gray-500 { color: #6b7280; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-700 { color: #374151; }
                .text-gray-800 { color: #1f2937; }
                .text-gray-900 { color: #111827; }

                /* Spacing */
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-3 { margin-bottom: 12px; }
                .mb-4 { margin-bottom: 16px; }
                .mb-6 { margin-bottom: 24px; }
                .mb-8 { margin-bottom: 32px; }
                .mt-1 { margin-top: 4px; }
                .mt-3 { margin-top: 12px; }
                .mt-4 { margin-top: 16px; }
                .mt-8 { margin-top: 32px; }
                .pt-2 { padding-top: 8px; }
                .pt-3 { padding-top: 12px; }
                .pt-4 { padding-top: 16px; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .py-3 { padding-top: 12px; padding-bottom: 12px; }
                .px-3 { padding-left: 12px; padding-right: 12px; }
                .p-4  { padding: 16px; }

                /* Common patterns */
                .uppercase { text-transform: uppercase; }
                .italic { font-style: italic; }
                .tracking-wide { letter-spacing: 0.025em; }
                .tracking-wider { letter-spacing: 0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .whitespace-pre-line { white-space: pre-line; }

                /* Reusable label pattern */
                .label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; }
                .label-bold { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }

                /* Table header base */
                .th-base { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
                .th-bold { font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
            </style>
        </head>
        <body>
            $body
        </body>
        </html>
        """.trimIndent()
    }

    // ── Modern Template ──────────────────────────────────────────────────────

    private fun modernTemplate(d: TemplateData): String {
        return """
        <!-- Header: Logo left, Invoice title + company right -->
        <table class="row mb-8">
            <tr>
                <td style="padding-top: 8px;">
                    ${logoImg(d.companyLogo, "56px", "160px")}
                </td>
                <td class="text-right">
                    <div class="text-4xl font-light tracking-wide mb-3" style="color: ${e(d.color)};">Invoice</div>
                    <div class="text-sm text-gray-800 font-semibold">${e(d.companyName)}</div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${addressLines(d)}
                        ${contactLine(d)}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Bill To Banner -->
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px 24px;" class="mb-8">
            <table class="row">
                <tr>
                    <td>
                        <div class="label">Bill To</div>
                        <div class="text-sm">
                            ${clientBlock(d)}
                        </div>
                    </td>
                    <td class="text-right text-sm">
                        ${invoiceMetaModern(d)}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Line Items -->
        ${lineItemsTable(d,
            headerBg = "", headerColor = "#9ca3af",
            headerBorder = "border-bottom: 2px solid #e5e7eb;",
            rowBorder = "border-bottom: 1px solid #f3f4f6;"
        )}

        <!-- Footer: Notes left, Totals right -->
        <table class="row">
            <tr>
                <td style="width: 55%;">
                    ${notesBlock(d.notes)}
                </td>
                <td style="width: 45%;" class="text-right">
                    <div style="margin-left: auto; width: 224px;">
                        ${totalsBlock(d)}
                        <!-- Amount Due Box -->
                        <div style="margin-top: 16px; border-radius: 8px; padding: 12px 16px; border: 1px solid #e5e7eb; border-top: 3px solid ${e(d.color)};">
                            <div class="label" style="margin-bottom: 4px;">Amount Due</div>
                            <div class="text-xl font-bold text-gray-900">${money(d.total, d.currency)}</div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        """.trimIndent()
    }

    // ── Classic Template ─────────────────────────────────────────────────────

    private fun classicTemplate(d: TemplateData): String {
        return """
        <div style="font-family: 'Georgia', 'Times New Roman', 'MainFont', serif;">
            <!-- Centered Header -->
            <div class="text-center mb-8" style="padding-bottom: 24px; border-bottom: 3px double ${e(d.color)};">
                ${if (!d.companyLogo.isNullOrBlank()) "<div style=\"margin-bottom: 12px;\"><img src=\"${e(d.companyLogo)}\" style=\"max-height: 56px; max-width: 160px; margin: 0 auto; display: block;\" /></div>" else ""}
                <div class="text-3xl font-bold tracking-wider uppercase mb-2" style="color: ${e(d.color)};">INVOICE</div>
                <div class="text-base font-semibold text-gray-800">${e(d.companyName)}</div>
                <div class="text-xs text-gray-500 mt-1">
                    ${addressLines(d)}
                    ${contactLine(d)}
                </div>
            </div>

            <!-- Bill To + Invoice Details -->
            <table class="row mb-8">
                <tr>
                    <td>
                        <div class="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Bill To</div>
                        <div class="text-sm">
                            ${clientBlock(d)}
                        </div>
                    </td>
                    <td class="text-right text-sm" style="line-height: 1.8;">
                        ${if (d.invoiceNumber.isNotBlank()) "<div><span class=\"text-gray-500 font-medium\">Invoice No: </span><span class=\"text-gray-800 font-semibold\">${e(d.invoiceNumber)}</span></div>" else ""}
                        <div><span class="text-gray-500 font-medium">Date: </span><span class="text-gray-800">${fmtDate(d.invoiceDate)}</span></div>
                        <div><span class="text-gray-500 font-medium">Due: </span><span class="text-gray-800">${fmtDate(d.dueDate)}</span></div>
                    </td>
                </tr>
            </table>

            <!-- Line Items -->
            ${lineItemsTable(d,
                colNames = arrayOf("Description", "Qty", "Rate", "Amount"),
                headerBg = "", headerColor = "#4b5563",
                headerBorder = "border-top: 2px solid ${e(d.color)}; border-bottom: 2px solid ${e(d.color)};",
                headerWeight = "700",
                rowBorder = "border-bottom: 1px solid #e5e7eb;",
                footerBorder = "border-top: 2px solid ${e(d.color)};"
            )}

            <!-- Footer -->
            <table class="row">
                <tr>
                    <td style="width: 55%;">
                        ${notesBlock(d.notes, italic = true, labelClass = "text-xs font-bold tracking-widest text-gray-500 uppercase mb-2")}
                    </td>
                    <td style="width: 45%;" class="text-right">
                        <div style="margin-left: auto; width: 224px;">
                            ${totalsBlock(d, showTotal = false)}
                            <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid ${e(d.color)};">
                                <table class="row"><tr>
                                    <td class="font-bold text-lg text-gray-700">Total Due</td>
                                    <td class="font-bold text-lg text-right" style="color: ${e(d.color)};">${money(d.total, d.currency)}</td>
                                </tr></table>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        """.trimIndent()
    }

    // ── Enterprise Template ──────────────────────────────────────────────────

    private fun enterpriseTemplate(d: TemplateData): String {
        // For the banner contact text, use a semi-transparent white workaround
        val bannerSubtextColor = "#ffffffb3" // won't work in openhtmltopdf, use pre-blended
        val contactOnColor = blendWithColor(d.color, 0.7) // 70% white on the color

        return """
        <!-- Top Banner -->
        <div style="background: ${e(d.color)}; border-radius: 8px 8px 0 0; padding: 20px 32px; margin: -15px -10px 32px -10px;">
            <table class="row">
                <tr>
                    <td>
                        <table><tr>
                            ${if (!d.companyLogo.isNullOrBlank()) "<td style=\"padding-right: 16px;\"><img src=\"${e(d.companyLogo)}\" style=\"max-height: 48px; max-width: 140px;\" /></td>" else ""}
                            <td>
                                <div class="text-lg font-bold text-white">${e(d.companyName)}</div>
                                <div class="text-xs" style="color: $contactOnColor; margin-top: 2px;">${contactParts(d)}</div>
                            </td>
                        </tr></table>
                    </td>
                    <td class="text-right text-white">
                        <div class="text-2xl font-light tracking-wider">INVOICE</div>
                        ${if (d.invoiceNumber.isNotBlank()) "<div class=\"text-sm\" style=\"color: $contactOnColor; margin-top: 2px;\">#${e(d.invoiceNumber)}</div>" else ""}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Bill To + Company Address -->
        <table class="row mb-8">
            <tr>
                <td>
                    <div class="label-bold mb-2" style="color: ${e(d.color)};">Bill To</div>
                    <div class="text-sm">
                        ${clientBlock(d)}
                    </div>
                </td>
                <td class="text-right">
                    <div class="label-bold mb-2" style="color: ${e(d.color)};">Company Address</div>
                    <div class="text-xs text-gray-500">
                        ${addressLines(d)}
                    </div>
                    <div class="mt-3 text-sm text-gray-600">
                        <div><span class="text-gray-400 text-xs">Date: </span>${fmtDate(d.invoiceDate)}</div>
                        <div><span class="text-gray-400 text-xs">Due: </span>${fmtDate(d.dueDate)}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Line Items -->
        ${lineItemsTable(d,
            headerBg = e(d.color), headerColor = "#ffffff",
            headerBorder = "",
            headerPad = "padding: 10px 12px;",
            cellPad = "padding: 12px;",
            rowBorder = "border-bottom: 1px solid #f3f4f6;",
            altRowBg = true
        )}

        <!-- Amount in Words -->
        <div class="mb-6" style="padding: 12px 16px; border-radius: 8px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <div class="label" style="margin-bottom: 4px;">Amount in Words</div>
            <div class="text-sm text-gray-700 font-medium italic">${numberToWords(d.total)} ${e(d.currency)}</div>
        </div>

        <!-- Footer -->
        <table class="row">
            <tr>
                <td style="width: 55%;">
                    ${notesBlock(d.notes)}
                    <!-- Signature -->
                    <div class="mt-8 pt-4">
                        <div style="border-top: 1px solid #d1d5db; width: 192px; padding-top: 8px;">
                            <div class="text-xs text-gray-500">${e(d.authorizedSignature ?: "Authorized Signature")}</div>
                        </div>
                    </div>
                </td>
                <td style="width: 45%;" class="text-right">
                    <div style="margin-left: auto; width: 224px;">
                        ${totalsBlock(d, borderColor = d.color)}
                    </div>
                </td>
            </tr>
        </table>
        """.trimIndent()
    }

    // ── Freelancer Template ──────────────────────────────────────────────────

    private fun freelancerTemplate(d: TemplateData): String {
        val tintBg = lightTint(d.color)

        return """
        <table class="row">
            <tr>
                <!-- Left accent bar -->
                <td style="width: 6px; background: ${e(d.color)}; border-radius: 4px 0 0 4px;"></td>
                <td style="padding-left: 32px;">

        <!-- Header -->
        <table class="row mb-8">
            <tr>
                <td>
                    <table><tr>
                        ${if (!d.companyLogo.isNullOrBlank()) "<td style=\"padding-right: 12px;\"><img src=\"${e(d.companyLogo)}\" style=\"max-height: 40px; max-width: 120px;\" /></td>" else ""}
                        <td class="text-xl font-bold text-gray-800">${e(d.companyName)}</td>
                    </tr></table>
                    <div class="text-xs text-gray-500 mt-1">
                        ${addressLines(d)}
                        ${contactLine(d)}
                    </div>
                </td>
                <td class="text-right">
                    <div class="text-3xl font-extrabold" style="color: ${e(d.color)};">Invoice</div>
                    ${if (d.invoiceNumber.isNotBlank()) "<div class=\"text-sm text-gray-500 mt-1\">#${e(d.invoiceNumber)}</div>" else ""}
                </td>
            </tr>
        </table>

        <!-- Info Cards -->
        <table class="row mb-8">
            <tr>
                <td style="width: 48%; border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px;">
                    <div class="label-bold mb-2" style="color: ${e(d.color)};">Bill To</div>
                    <div class="text-sm">
                        ${clientBlock(d)}
                    </div>
                </td>
                <td style="width: 4%;"></td>
                <td style="width: 48%; border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px;">
                    <div class="label-bold mb-2" style="color: ${e(d.color)};">Details</div>
                    <div class="text-sm">
                        <div class="mb-2">
                            <div class="text-gray-400 text-xs">Issue Date</div>
                            <div class="text-gray-800 font-medium">${fmtDate(d.invoiceDate)}</div>
                        </div>
                        <div>
                            <div class="text-gray-400 text-xs">Due Date</div>
                            <div class="text-gray-800 font-medium">${fmtDate(d.dueDate)}</div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Line Items -->
        ${lineItemsTable(d,
            headerBg = tintBg, headerColor = e(d.color),
            headerBorder = "",
            headerPad = "padding: 10px 12px;",
            cellPad = "padding: 12px;",
            rowBorder = "border-bottom: 1px solid #f3f4f6;"
        )}

        <!-- Footer -->
        <table class="row">
            <tr>
                <td style="width: 50%;">
                    ${if (!d.notes.isNullOrBlank()) """
                    <div style="border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px;">
                        <div class="label-bold" style="color: ${e(d.color)}; margin-bottom: 6px;">Notes</div>
                        <p class="text-xs text-gray-500 whitespace-pre-line" style="margin: 0;">${e(d.notes!!)}</p>
                    </div>
                    """ else ""}
                </td>
                <td style="width: 50%;" class="text-right">
                    <div style="margin-left: auto; width: 224px;">
                        ${totalsBlock(d, showTotal = false)}
                        <!-- Amount Due callout -->
                        <div style="margin-top: 16px; border-radius: 12px; padding: 16px 20px; color: #ffffff; background: ${e(d.color)};">
                            <div class="text-xs uppercase tracking-wider" style="margin-bottom: 4px;">Amount Due</div>
                            <div class="text-2xl font-extrabold">${money(d.total, d.currency)}</div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

                </td>
            </tr>
        </table>
        """.trimIndent()
    }

    // ── Corporate Template ───────────────────────────────────────────────────

    private fun corporateTemplate(d: TemplateData): String {
        // Watermark: use very light color instead of opacity (openhtmltopdf doesn't do 3% opacity well)
        val watermarkColor = lightTint(d.color, factor = 0.04)

        return """
        <div style="position: relative;">

        <!-- Watermark -->
        <div style="position: absolute; top: 250px; left: -50px; width: 800px; text-align: center;">
            <div style="font-size: 120px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: $watermarkColor; transform: rotate(-35deg); white-space: nowrap;">INVOICE</div>
        </div>

        <!-- Header -->
        <table class="row mb-8" style="position: relative;">
            <tr>
                <td>
                    ${if (!d.companyLogo.isNullOrBlank()) "<div class=\"mb-2\"><img src=\"${e(d.companyLogo)}\" style=\"max-height: 56px; max-width: 160px;\" /></div>" else ""}
                    <div class="text-lg font-bold text-gray-800">${e(d.companyName)}</div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${addressLines(d)}
                        ${contactLine(d)}
                    </div>
                </td>
                <td class="text-right">
                    <div class="text-sm font-bold uppercase mb-2" style="letter-spacing: 0.3em; color: ${e(d.color)};">INVOICE</div>
                    <div style="height: 2px; background: ${e(d.color)}; margin-bottom: 12px;"></div>
                    <div class="text-sm">
                        ${if (d.invoiceNumber.isNotBlank()) """
                        <table class="row"><tr>
                            <td class="text-gray-400 text-xs uppercase tracking-wider">No.</td>
                            <td class="text-gray-800 font-semibold text-right" style="min-width: 100px;">${e(d.invoiceNumber)}</td>
                        </tr></table>
                        """ else ""}
                        <table class="row"><tr>
                            <td class="text-gray-400 text-xs uppercase tracking-wider">Date</td>
                            <td class="text-gray-800 text-right" style="min-width: 100px;">${fmtDate(d.invoiceDate)}</td>
                        </tr></table>
                        <table class="row"><tr>
                            <td class="text-gray-400 text-xs uppercase tracking-wider">Due</td>
                            <td class="text-gray-800 text-right" style="min-width: 100px;">${fmtDate(d.dueDate)}</td>
                        </tr></table>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Bill To -->
        <div class="mb-8" style="border-left: 4px solid ${e(d.color)}; padding-left: 16px; padding-top: 12px; padding-bottom: 12px;">
            <div class="label-bold text-gray-400" style="margin-bottom: 8px;">Bill To</div>
            <div class="text-sm">
                ${clientBlock(d)}
            </div>
        </div>

        <!-- Line Items -->
        ${lineItemsTable(d,
            colNames = arrayOf("Description", "Qty", "Unit Price", "Amount"),
            headerBg = "", headerColor = "#4b5563",
            headerWeight = "700",
            headerBorder = "border-top: 2px solid ${e(d.color)}; border-bottom: 2px solid ${e(d.color)};",
            rowBorder = "border-bottom: 1px solid #f3f4f6;"
        )}

        <!-- Totals right-aligned -->
        <table class="row mb-6">
            <tr>
                <td></td>
                <td style="width: 256px;">
                    ${totalsBlock(d, borderColor = d.color, totalLabel = "Total Due")}
                </td>
            </tr>
        </table>

        <!-- Amount in Words -->
        <div class="mb-6" style="padding: 8px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
            <div class="text-xs text-gray-400 uppercase tracking-wider" style="margin-bottom: 2px;">Amount in Words</div>
            <div class="text-sm text-gray-700 font-medium">${numberToWords(d.total)} ${e(d.currency)}</div>
        </div>

        <!-- Footer -->
        <table class="row">
            <tr>
                <td style="width: 55%; vertical-align: bottom;">
                    ${notesBlock(d.notes)}
                </td>
                <td style="width: 45%; vertical-align: bottom;" class="text-center">
                    <!-- Signature block -->
                    <div style="width: 208px; margin-left: auto;">
                        <div style="border-top: 2px solid #d1d5db; padding-top: 8px; margin-top: 16px;">
                            <div class="text-sm text-gray-700 font-medium">${e(d.authorizedSignature ?: "Authorized Signature")}</div>
                            <div class="text-xs text-gray-400 mt-1">${e(d.companyName)}</div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        </div>
        """.trimIndent()
    }

    // ── Shared Helpers ───────────────────────────────────────────────────────

    private fun logoImg(logo: String?, maxH: String, maxW: String): String {
        if (logo.isNullOrBlank()) return "<div style=\"width: 56px; height: 56px; border-radius: 8px; background: #f3f4f6;\"></div>"
        return "<img src=\"${e(logo)}\" style=\"max-height: $maxH; max-width: $maxW;\" />"
    }

    private fun addressLines(d: TemplateData): String {
        val parts = mutableListOf<String>()
        if (d.address.isNotBlank()) parts.add("<div>${e(d.address)}</div>")
        val cityZip = listOf(d.city, d.zipCode).filter { it.isNotBlank() }.joinToString(", ")
        if (cityZip.isNotBlank()) parts.add("<div>${e(cityZip)}</div>")
        if (d.country.isNotBlank()) parts.add("<div>${e(d.country)}</div>")
        return parts.joinToString("")
    }

    private fun contactParts(d: TemplateData): String {
        return listOfNotNull(d.phone.takeIf { it.isNotBlank() }, d.companyEmail.takeIf { it.isNotBlank() }).joinToString(" \u00B7 ")
    }

    private fun contactLine(d: TemplateData): String {
        val cp = contactParts(d)
        return if (cp.isNotBlank()) "<div>${e(cp)}</div>" else ""
    }

    private fun clientBlock(d: TemplateData): String {
        val parts = mutableListOf<String>()
        d.clientName?.takeIf { it.isNotBlank() }?.let { parts.add("<div class=\"font-semibold text-gray-800\">${e(it)}</div>") }
        d.clientCompany?.takeIf { it.isNotBlank() }?.let { parts.add("<div class=\"text-gray-600\">${e(it)}</div>") }
        d.clientEmail?.takeIf { it.isNotBlank() }?.let { parts.add("<div class=\"text-gray-500\">${e(it)}</div>") }
        d.clientAddress?.takeIf { it.isNotBlank() }?.let { parts.add("<div class=\"text-gray-500\">${e(it)}</div>") }
        val loc = listOfNotNull(d.clientCity, d.clientZip, d.clientCountry).filter { it.isNotBlank() }.joinToString(", ")
        if (loc.isNotBlank()) parts.add("<div class=\"text-gray-500\">${e(loc)}</div>")
        if (parts.isEmpty()) parts.add("<div class=\"text-gray-400 italic\">No client info</div>")
        return parts.joinToString("")
    }

    private fun invoiceMetaModern(d: TemplateData): String {
        val parts = mutableListOf<String>()
        if (d.invoiceNumber.isNotBlank()) {
            parts.add("""
                <div class="mb-2">
                    <div class="label" style="margin-bottom: 0;">Invoice #</div>
                    <div class="text-gray-800 font-medium">${e(d.invoiceNumber)}</div>
                </div>
            """.trimIndent())
        }
        parts.add("""
            <div class="mb-2">
                <div class="label" style="margin-bottom: 0;">Date</div>
                <div class="text-gray-800">${fmtDate(d.invoiceDate)}</div>
            </div>
            <div>
                <div class="label" style="margin-bottom: 0;">Due Date</div>
                <div class="text-gray-800">${fmtDate(d.dueDate)}</div>
            </div>
        """.trimIndent())
        return parts.joinToString("")
    }

    private fun lineItemsTable(
        d: TemplateData,
        colNames: Array<String> = arrayOf("Item", "Qty", "Price", "Amount"),
        headerBg: String = "",
        headerColor: String = "#9ca3af",
        headerBorder: String = "",
        headerPad: String = "padding: 10px 0;",
        headerWeight: String = "600",
        cellPad: String = "padding: 12px 0;",
        rowBorder: String = "",
        footerBorder: String = "",
        altRowBg: Boolean = false
    ): String {
        val bgStyle = if (headerBg.isNotBlank()) "background: $headerBg;" else ""

        val rows = d.items.mapIndexed { i, item ->
            val bg = if (altRowBg && i % 2 == 0) "background: #fafafa;" else ""
            """<tr style="$rowBorder $bg">
                <td style="$cellPad color: #1f2937;">${e(item.description)}</td>
                <td style="$cellPad text-align: center; color: #4b5563;">${item.quantity}</td>
                <td style="$cellPad text-align: right; color: #4b5563;">${money(item.rate, d.currency)}</td>
                <td style="$cellPad text-align: right; color: #1f2937; font-weight: 500;">${money(item.amount, d.currency)}</td>
            </tr>"""
        }.joinToString("")

        val footer = if (footerBorder.isNotBlank()) "<tfoot><tr style=\"$footerBorder\"><td colspan=\"4\"></td></tr></tfoot>" else ""

        return """
        <table style="width: 100%; font-size: 14px;" class="mb-8">
            <thead>
                <tr style="$headerBorder $bgStyle">
                    <th style="text-align: left; $headerPad font-size: 12px; font-weight: $headerWeight; letter-spacing: 0.05em; color: $headerColor; text-transform: uppercase;">${colNames[0]}</th>
                    <th style="text-align: center; width: 64px; $headerPad font-size: 12px; font-weight: $headerWeight; letter-spacing: 0.05em; color: $headerColor; text-transform: uppercase;">${colNames[1]}</th>
                    <th style="text-align: right; width: 112px; $headerPad font-size: 12px; font-weight: $headerWeight; letter-spacing: 0.05em; color: $headerColor; text-transform: uppercase;">${colNames[2]}</th>
                    <th style="text-align: right; width: 112px; $headerPad font-size: 12px; font-weight: $headerWeight; letter-spacing: 0.05em; color: $headerColor; text-transform: uppercase;">${colNames[3]}</th>
                </tr>
            </thead>
            <tbody>$rows</tbody>
            $footer
        </table>
        """.trimIndent()
    }

    private fun totalsBlock(
        d: TemplateData,
        borderColor: String? = null,
        showTotal: Boolean = true,
        totalLabel: String = "Total"
    ): String {
        val bc = borderColor ?: "#e5e7eb"
        val parts = mutableListOf<String>()
        parts.add(totalRow("Subtotal", money(d.subtotal, d.currency)))
        if (d.discountAmount > BigDecimal.ZERO) {
            parts.add(totalRow("Discount", "-${money(d.discountAmount, d.currency)}"))
        }
        if ((d.taxRate ?: 0.0) > 0) {
            parts.add(totalRow("Tax (${d.taxRate}%)", money(d.taxAmount, d.currency)))
        }
        if (showTotal) {
            parts.add("""
                <div style="border-top: 2px solid $bc; padding-top: 8px; margin-top: 4px;">
                    <table style="width: 100%;"><tr>
                        <td style="font-weight: 700; font-size: 16px; color: #374151;">$totalLabel</td>
                        <td style="font-weight: 700; font-size: 16px; color: ${borderColor ?: "#111827"}; text-align: right;">${money(d.total, d.currency)}</td>
                    </tr></table>
                </div>
            """.trimIndent())
        }
        return parts.joinToString("")
    }

    private fun totalRow(label: String, value: String): String {
        return """<table style="width: 100%; margin-bottom: 8px; font-size: 14px;"><tr>
            <td class="text-gray-500">$label</td>
            <td class="text-gray-800 text-right">$value</td>
        </tr></table>"""
    }

    private fun notesBlock(
        notes: String?,
        italic: Boolean = false,
        labelClass: String = "label"
    ): String {
        if (notes.isNullOrBlank()) return ""
        val style = if (italic) "font-style: italic;" else ""
        return """
            <div>
                <div class="$labelClass" style="margin-bottom: 6px;">Notes / Terms</div>
                <p class="text-xs text-gray-500 whitespace-pre-line" style="margin: 0; $style">${e(notes)}</p>
            </div>
        """.trimIndent()
    }

    /** Blend a hex color toward white. factor=0.08 → 8% of the color, 92% white. */
    private fun lightTint(hexColor: String, factor: Double = 0.08): String {
        val hex = hexColor.trimStart('#')
        val r = Integer.parseInt(hex.substring(0, 2), 16)
        val g = Integer.parseInt(hex.substring(2, 4), 16)
        val b = Integer.parseInt(hex.substring(4, 6), 16)
        val tr = (255 + (r - 255) * factor).toInt().coerceIn(0, 255)
        val tg = (255 + (g - 255) * factor).toInt().coerceIn(0, 255)
        val tb = (255 + (b - 255) * factor).toInt().coerceIn(0, 255)
        return String.format("#%02x%02x%02x", tr, tg, tb)
    }

    /** Blend white onto a colored background at a given alpha. For text on colored banners. */
    private fun blendWithColor(hexColor: String, alpha: Double): String {
        val hex = hexColor.trimStart('#')
        val r = Integer.parseInt(hex.substring(0, 2), 16)
        val g = Integer.parseInt(hex.substring(2, 4), 16)
        val b = Integer.parseInt(hex.substring(4, 6), 16)
        // white (255) at alpha over the base color
        val br = (255 * alpha + r * (1 - alpha)).toInt().coerceIn(0, 255)
        val bg = (255 * alpha + g * (1 - alpha)).toInt().coerceIn(0, 255)
        val bb = (255 * alpha + b * (1 - alpha)).toInt().coerceIn(0, 255)
        return String.format("#%02x%02x%02x", br, bg, bb)
    }

    private fun money(amount: BigDecimal, currencyCode: String): String {
        val symbol = currencySymbols[currencyCode] ?: currencyCode
        return "$symbol${String.format("%,.2f", amount)}"
    }

    private fun fmtDate(date: LocalDate): String = date.format(dateFormatter)

    private fun e(text: String): String = text
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
