package com.invoicer.exception

class InvoiceNotFoundException(message: String) : RuntimeException(message)

class DuplicateInvoiceNumberException(message: String) : RuntimeException(message)

class InvoiceAccessDeniedException(message: String) : RuntimeException(message)

class AdminAccessDeniedException(message: String) : RuntimeException(message)

class EmailSendException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)
