package com.invoicer.service

import com.invoicer.config.ResendConfig
import com.invoicer.entity.Invoice
import com.invoicer.exception.EmailSendException
import com.resend.Resend
import com.resend.services.emails.model.CreateEmailOptions
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.NumberFormat
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class EmailService(
    private val config: ResendConfig
) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java)
    private val dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy")
    private val currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US)

    fun sendInvoiceEmail(invoice: Invoice) {
        if (config.apiKey.isBlank()) {
            logger.debug("Resend API key not configured, skipping email send")
            return
        }

        if (invoice.clientEmail.isNullOrBlank()) {
            logger.debug("No client email on invoice ${invoice.invoiceNumber}, skipping email send")
            return
        }

        val resend = Resend(config.apiKey)

        val subject = invoice.emailSubject?.takeIf { it.isNotBlank() }
            ?: "Invoice ${invoice.invoiceNumber} from ${invoice.companyName}"

        val htmlBody = buildInvoiceHtml(invoice)

        val params = CreateEmailOptions.builder()
            .from(config.fromEmail)
            .to(invoice.clientEmail!!)
            .replyTo(invoice.companyEmail)
            .subject(subject)
            .html(htmlBody)
            .build()

        try {
            val response = resend.emails().send(params)
            logger.info("Invoice email sent for ${invoice.invoiceNumber}, Resend ID: ${response.id}")
        } catch (e: Exception) {
            throw EmailSendException("Failed to send invoice email for ${invoice.invoiceNumber}", e)
        }
    }

    private fun buildInvoiceHtml(invoice: Invoice): String {
        val color = invoice.primaryColor
        val subtotal = invoice.lineItems.fold(BigDecimal.ZERO) { acc, item -> acc.add(item.amount) }
        val discountAmount = invoice.discount?.let { BigDecimal.valueOf(it) } ?: BigDecimal.ZERO
        val taxableAmount = subtotal.subtract(discountAmount)
        val taxAmount = invoice.taxRate?.let {
            taxableAmount.multiply(BigDecimal.valueOf(it)).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        } ?: BigDecimal.ZERO

        val lineItemsHtml = invoice.lineItems.joinToString("") { item ->
            """
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #eee;">${escapeHtml(item.description)}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #eee; text-align: right;">${currencyFormatter.format(item.rate)}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #eee; text-align: right;">${currencyFormatter.format(item.amount)}</td>
            </tr>
            """.trimIndent()
        }

        val emailMessage = invoice.emailMessage?.takeIf { it.isNotBlank() }?.let {
            """<p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">${escapeHtml(it)}</p>"""
        } ?: ""

        val discountRow = if (discountAmount > BigDecimal.ZERO) {
            """
            <tr>
                <td style="padding: 8px 16px; text-align: right; color: #555;">Discount</td>
                <td style="padding: 8px 16px; text-align: right; color: #555;">-${currencyFormatter.format(discountAmount)}</td>
            </tr>
            """.trimIndent()
        } else ""

        val taxRow = if (taxAmount > BigDecimal.ZERO) {
            """
            <tr>
                <td style="padding: 8px 16px; text-align: right; color: #555;">Tax (${invoice.taxRate}%)</td>
                <td style="padding: 8px 16px; text-align: right; color: #555;">${currencyFormatter.format(taxAmount)}</td>
            </tr>
            """.trimIndent()
        } else ""

        val notesHtml = invoice.notes?.takeIf { it.isNotBlank() }?.let {
            """
            <div style="margin-top: 32px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #333;">Notes</p>
                <p style="margin: 0; color: #555; font-size: 14px;">${escapeHtml(it)}</p>
            </div>
            """.trimIndent()
        } ?: ""

        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif;">
            <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
                <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <div style="background: $color; padding: 32px; color: #fff;">
                        <h1 style="margin: 0; font-size: 24px;">${escapeHtml(invoice.companyName)}</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Invoice ${escapeHtml(invoice.invoiceNumber)}</p>
                    </div>

                    <div style="padding: 32px;">
                        $emailMessage

                        <!-- Invoice Meta -->
                        <table style="width: 100%; margin-bottom: 24px;" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="vertical-align: top; width: 50%;">
                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase;">Bill To</p>
                                    <p style="margin: 0; font-weight: 600; color: #333;">${escapeHtml(invoice.clientName ?: "")}</p>
                                    ${if (!invoice.clientCompany.isNullOrBlank()) "<p style=\"margin: 2px 0; color: #555; font-size: 14px;\">${escapeHtml(invoice.clientCompany!!)}</p>" else ""}
                                    ${if (!invoice.clientAddress.isNullOrBlank()) "<p style=\"margin: 2px 0; color: #555; font-size: 14px;\">${escapeHtml(invoice.clientAddress!!)}</p>" else ""}
                                    ${if (!invoice.clientCity.isNullOrBlank() || !invoice.clientZip.isNullOrBlank()) "<p style=\"margin: 2px 0; color: #555; font-size: 14px;\">${escapeHtml(listOfNotNull(invoice.clientCity, invoice.clientZip).joinToString(", "))}</p>" else ""}
                                    ${if (!invoice.clientCountry.isNullOrBlank()) "<p style=\"margin: 2px 0; color: #555; font-size: 14px;\">${escapeHtml(invoice.clientCountry!!)}</p>" else ""}
                                </td>
                                <td style="vertical-align: top; width: 50%; text-align: right;">
                                    <p style="margin: 0 0 8px 0;"><span style="color: #999; font-size: 12px;">INVOICE DATE</span><br><span style="color: #333;">${invoice.invoiceDate.format(dateFormatter)}</span></p>
                                    <p style="margin: 0;"><span style="color: #999; font-size: 12px;">DUE DATE</span><br><span style="color: #333;">${invoice.dueDate.format(dateFormatter)}</span></p>
                                </td>
                            </tr>
                        </table>

                        <!-- Line Items -->
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr style="background: ${color}11;">
                                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: $color; text-transform: uppercase; border-bottom: 2px solid ${color}33;">Description</th>
                                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: $color; text-transform: uppercase; border-bottom: 2px solid ${color}33;">Qty</th>
                                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: $color; text-transform: uppercase; border-bottom: 2px solid ${color}33;">Rate</th>
                                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: $color; text-transform: uppercase; border-bottom: 2px solid ${color}33;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                $lineItemsHtml
                            </tbody>
                        </table>

                        <!-- Totals -->
                        <table style="width: 100%; max-width: 300px; margin-left: auto;" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding: 8px 16px; text-align: right; color: #555;">Subtotal</td>
                                <td style="padding: 8px 16px; text-align: right; color: #555;">${currencyFormatter.format(subtotal)}</td>
                            </tr>
                            $discountRow
                            $taxRow
                            <tr style="border-top: 2px solid $color;">
                                <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: $color; font-size: 16px;">Total</td>
                                <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: $color; font-size: 16px;">${currencyFormatter.format(invoice.totalAmount)}</td>
                            </tr>
                        </table>

                        $notesHtml
                    </div>

                    <!-- Footer -->
                    <div style="padding: 24px 32px; background: #fafafa; border-top: 1px solid #eee; text-align: center;">
                        <p style="margin: 0; color: #999; font-size: 13px;">
                            ${escapeHtml(invoice.companyName)} &middot; ${escapeHtml(invoice.companyEmail)}
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """.trimIndent()
    }

    private fun escapeHtml(text: String): String {
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;")
    }
}
