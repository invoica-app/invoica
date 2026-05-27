package com.invoicer.service

import com.invoicer.dto.CreateInvoiceRequest
import com.invoicer.dto.LineItemRequest
import com.invoicer.dto.UpdateInvoiceRequest
import com.invoicer.entity.Invoice
import com.invoicer.entity.InvoiceStatus
import com.invoicer.entity.LineItem
import com.invoicer.exception.DuplicateInvoiceNumberException
import com.invoicer.exception.InvoiceAccessDeniedException
import com.invoicer.exception.InvoiceNotFoundException
import com.invoicer.repository.InvoiceRepository
import com.invoicer.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

class InvoiceServiceTest {

    private lateinit var invoiceRepository: InvoiceRepository
    private lateinit var emailService: EmailService
    private lateinit var userRepository: UserRepository
    private lateinit var service: InvoiceService

    private val userId = 1L
    private val otherUserId = 2L
    private var nextInvoiceId = 1L
    private var nextLineItemId = 1L

    @BeforeEach
    fun setUp() {
        invoiceRepository = mock()
        emailService = mock()
        userRepository = mock()
        nextInvoiceId = 1L
        nextLineItemId = 1L
        whenever(userRepository.findById(any())).thenReturn(Optional.empty())
        service = InvoiceService(invoiceRepository, emailService, userRepository)
    }

    @Test
    fun `createInvoice saves and returns response`() {
        val request = createRequest()
        whenever(invoiceRepository.existsByInvoiceNumberAndUserId("INV-001", userId)).thenReturn(false)
        mockSaveInvoice()
        doNothing().whenever(emailService).sendInvoiceEmail(any())

        val response = service.createInvoice(request, userId)

        assertEquals("Test Co", response.companyName)
        assertEquals("INV-001", response.invoiceNumber)
        assertEquals(1, response.lineItems.size)
        assertTrue(response.totalAmount.compareTo(BigDecimal("100.00")) == 0)
        verify(invoiceRepository, times(2)).save(any<Invoice>())
    }

    @Test
    fun `createInvoice rejects duplicate invoice number`() {
        whenever(invoiceRepository.existsByInvoiceNumberAndUserId("INV-001", userId)).thenReturn(true)

        assertThrows<DuplicateInvoiceNumberException> {
            service.createInvoice(createRequest(), userId)
        }
    }

    @Test
    fun `createInvoice skips email when sendEmail is false`() {
        val request = createRequest()
        whenever(invoiceRepository.existsByInvoiceNumberAndUserId("INV-001", userId)).thenReturn(false)
        mockSaveInvoice()

        val response = service.createInvoice(request, userId, sendEmail = false)

        assertEquals(InvoiceStatus.DRAFT, response.status)
        verify(emailService, never()).sendInvoiceEmail(any())
        verify(invoiceRepository, times(1)).save(any<Invoice>())
    }

    @Test
    fun `createInvoice saves as DRAFT when email fails`() {
        val request = createRequest()
        whenever(invoiceRepository.existsByInvoiceNumberAndUserId("INV-001", userId)).thenReturn(false)
        mockSaveInvoice()
        doThrow(RuntimeException("SMTP down")).whenever(emailService).sendInvoiceEmail(any())

        val response = service.createInvoice(request, userId)

        assertEquals(InvoiceStatus.DRAFT, response.status)
        verify(invoiceRepository, times(1)).save(any<Invoice>())
    }

    @Test
    fun `getInvoice returns response for owner`() {
        val invoice = testInvoice(userId)
        whenever(invoiceRepository.findByIdWithLineItems(1L)).thenReturn(invoice)

        val response = service.getInvoice(1L, userId)

        assertEquals("INV-001", response.invoiceNumber)
    }

    @Test
    fun `getInvoice throws when not found`() {
        whenever(invoiceRepository.findByIdWithLineItems(99L)).thenReturn(null)

        assertThrows<InvoiceNotFoundException> {
            service.getInvoice(99L, userId)
        }
    }

    @Test
    fun `getInvoice throws for non-owner`() {
        val invoice = testInvoice(otherUserId)
        whenever(invoiceRepository.findByIdWithLineItems(1L)).thenReturn(invoice)

        assertThrows<InvoiceAccessDeniedException> {
            service.getInvoice(1L, userId)
        }
    }

    @Test
    fun `deleteInvoice removes invoice for owner`() {
        val invoice = testInvoice(userId)
        whenever(invoiceRepository.findById(1L)).thenReturn(Optional.of(invoice))

        service.deleteInvoice(1L, userId)

        verify(invoiceRepository).deleteById(1L)
    }

    @Test
    fun `deleteInvoice throws for non-owner`() {
        val invoice = testInvoice(otherUserId)
        whenever(invoiceRepository.findById(1L)).thenReturn(Optional.of(invoice))

        assertThrows<InvoiceAccessDeniedException> {
            service.deleteInvoice(1L, userId)
        }
    }

    @Test
    fun `recordDownload increments count`() {
        val invoice = testInvoice(userId)
        assertEquals(0, invoice.downloadCount)
        whenever(invoiceRepository.findById(1L)).thenReturn(Optional.of(invoice))
        mockSaveInvoice()

        service.recordDownload(1L, userId)

        assertEquals(1, invoice.downloadCount)
        assertNotNull(invoice.lastDownloadedAt)
    }

    @Test
    fun `updateInvoice recalculates total with new line items`() {
        val invoice = testInvoice(userId)
        whenever(invoiceRepository.findByIdWithLineItems(1L)).thenReturn(invoice)
        mockSaveInvoice()

        val updateRequest = UpdateInvoiceRequest(
            lineItems = listOf(
                LineItemRequest(description = "Item A", quantity = 2, rate = BigDecimal("50.00")),
                LineItemRequest(description = "Item B", quantity = 1, rate = BigDecimal("75.00")),
            )
        )

        val response = service.updateInvoice(1L, updateRequest, userId)

        assertEquals(2, response.lineItems.size)
        // 2*50 + 1*75 = 175
        assertTrue(response.totalAmount.compareTo(BigDecimal("175.00")) == 0)
    }

    @Test
    fun `updateInvoice rejects duplicate invoice number from another invoice`() {
        val invoice = testInvoice(userId)
        whenever(invoiceRepository.findByIdWithLineItems(1L)).thenReturn(invoice)
        whenever(invoiceRepository.existsByInvoiceNumberAndUserId("INV-999", userId)).thenReturn(true)

        assertThrows<DuplicateInvoiceNumberException> {
            service.updateInvoice(1L, UpdateInvoiceRequest(invoiceNumber = "INV-999"), userId)
        }
    }

    private fun createRequest() = CreateInvoiceRequest(
        companyName = "Test Co",
        address = "123 St",
        city = "Accra",
        zipCode = "00233",
        country = "Ghana",
        phone = "+233241234567",
        companyEmail = "test@co.com",
        invoiceNumber = "INV-001",
        invoiceDate = LocalDate.of(2026, 1, 15),
        dueDate = LocalDate.of(2026, 2, 15),
        currency = "GHS",
        clientEmail = "client@example.com",
        lineItems = listOf(
            LineItemRequest(description = "Consulting", quantity = 1, rate = BigDecimal("100.00"))
        ),
    )

    private fun mockSaveInvoice() {
        whenever(invoiceRepository.save(any<Invoice>())).thenAnswer {
            persist(it.arguments[0] as Invoice)
        }
    }

    private fun persist(invoice: Invoice): Invoice {
        if (invoice.id == null) {
            setField(invoice, "id", nextInvoiceId++)
        }
        invoice.lineItems.forEach { lineItem ->
            if (lineItem.id == null) {
                setField(lineItem, "id", nextLineItemId++)
            }
        }
        return invoice
    }

    private fun setField(target: Any, fieldName: String, value: Long) {
        target.javaClass.getDeclaredField(fieldName).apply {
            isAccessible = true
            set(target, value)
        }
    }

    private fun testInvoice(ownerUserId: Long): Invoice {
        val invoice = Invoice(
            id = 1L,
            companyName = "Test Co",
            address = "123 St",
            city = "Accra",
            zipCode = "00233",
            country = "Ghana",
            phone = "+233241234567",
            companyEmail = "test@co.com",
            invoiceNumber = "INV-001",
            invoiceDate = LocalDate.of(2026, 1, 15),
            dueDate = LocalDate.of(2026, 2, 15),
            currency = "GHS",
            clientEmail = "client@example.com",
            totalAmount = BigDecimal("100.00"),
            userId = ownerUserId,
        )
        invoice.lineItems.add(
            LineItem(
                id = 1L,
                description = "Consulting",
                quantity = 1,
                rate = BigDecimal("100.00"),
                amount = BigDecimal("100.00"),
                invoice = invoice,
            )
        )
        return invoice
    }
}
