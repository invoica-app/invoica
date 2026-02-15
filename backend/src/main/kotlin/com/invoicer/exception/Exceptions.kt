package com.invoicer.exception

class InvoiceNotFoundException(message: String) : RuntimeException(message)

class DuplicateInvoiceNumberException(message: String) : RuntimeException(message)

class InvoiceAccessDeniedException(message: String) : RuntimeException(message)
