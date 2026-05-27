package com.invoicer.service

import com.invoicer.entity.LineItem
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.math.BigDecimal

class InvoiceCalculatorTest {

    @Test
    fun `subtotal sums line item amounts`() {
        val items = listOf(
            lineItem(amount = "100.00"),
            lineItem(amount = "250.50"),
            lineItem(amount = "49.50"),
        )
        assertEquals(BigDecimal("400.00"), InvoiceCalculator.subtotal(items))
    }

    @Test
    fun `subtotal of empty list is zero`() {
        assertEquals(BigDecimal.ZERO, InvoiceCalculator.subtotal(emptyList()))
    }

    @Test
    fun `total with no discount and no tax equals subtotal`() {
        val result = InvoiceCalculator.calculateTotal(
            subtotal = BigDecimal("500.00"),
            discount = null,
            taxRate = null,
        )
        assertEquals(BigDecimal("500.00"), result)
    }

    @Test
    fun `total subtracts flat discount`() {
        val result = InvoiceCalculator.calculateTotal(
            subtotal = BigDecimal("500.00"),
            discount = BigDecimal("50.00"),
            taxRate = null,
        )
        assertEquals(BigDecimal("450.00"), result)
    }

    @Test
    fun `total adds tax on amount after discount`() {
        val result = InvoiceCalculator.calculateTotal(
            subtotal = BigDecimal("1000.00"),
            discount = BigDecimal("200.00"),
            taxRate = BigDecimal("10"),
        )
        // subtotal 1000 - discount 200 = 800 taxable, tax = 80
        // total = 1000 - 200 + 80 = 880
        assertEquals(BigDecimal("880.00"), result)
    }

    @Test
    fun `total with tax only and no discount`() {
        val result = InvoiceCalculator.calculateTotal(
            subtotal = BigDecimal("200.00"),
            discount = null,
            taxRate = BigDecimal("15"),
        )
        // tax = 200 * 15 / 100 = 30
        assertEquals(BigDecimal("230.00"), result)
    }

    @Test
    fun `tax rounds to two decimal places using HALF_UP`() {
        val result = InvoiceCalculator.calculateTotal(
            subtotal = BigDecimal("100.00"),
            discount = null,
            taxRate = BigDecimal("7.5"),
        )
        // tax = 100 * 7.5 / 100 = 7.50
        assertEquals(BigDecimal("107.50"), result)
    }

    @Test
    fun `tax rounding on odd cents`() {
        val result = InvoiceCalculator.calculateTotal(
            subtotal = BigDecimal("33.33"),
            discount = null,
            taxRate = BigDecimal("7"),
        )
        // tax = 33.33 * 7 / 100 = 2.3331 -> 2.33 (HALF_UP)
        assertEquals(BigDecimal("35.66"), result)
    }

    @Test
    fun `zero discount and zero tax`() {
        val result = InvoiceCalculator.calculateTotal(
            subtotal = BigDecimal("100.00"),
            discount = BigDecimal.ZERO,
            taxRate = BigDecimal.ZERO,
        )
        assertEquals(BigDecimal("100.00"), result)
    }

    private fun lineItem(amount: String): LineItem {
        val amt = BigDecimal(amount)
        return LineItem(
            description = "test",
            quantity = 1,
            rate = amt,
            amount = amt,
        )
    }
}
