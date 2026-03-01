package com.invoicer.exception

class InvoiceNotFoundException(message: String) : RuntimeException(message)

class DuplicateInvoiceNumberException(message: String) : RuntimeException(message)

class InvoiceAccessDeniedException(message: String) : RuntimeException(message)

class AdminAccessDeniedException(message: String) : RuntimeException(message)

class EmailSendException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

class AccountDisabledException(message: String) : RuntimeException(message)

class OAuthAuthenticationException(message: String) : RuntimeException(message)

class GuestLimitExceededException(message: String) : RuntimeException(message)
