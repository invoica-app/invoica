package com.invoicer.service

import com.invoicer.entity.LineItem
import java.math.BigDecimal
import java.math.RoundingMode

object InvoiceCalculator {

    fun subtotal(lineItems: List<LineItem>): BigDecimal =
        lineItems.fold(BigDecimal.ZERO) { acc, item -> acc.add(item.amount) }

    fun calculateTotal(subtotal: BigDecimal, discount: BigDecimal?, taxRate: BigDecimal?): BigDecimal {
        val discountAmount = discount ?: BigDecimal.ZERO
        val taxableAmount = subtotal.subtract(discountAmount)
        val taxAmount = taxRate?.let {
            taxableAmount.multiply(it).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        } ?: BigDecimal.ZERO
        return subtotal.subtract(discountAmount).add(taxAmount)
    }
}
