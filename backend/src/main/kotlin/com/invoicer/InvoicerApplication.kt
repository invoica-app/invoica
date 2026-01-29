package com.invoicer

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class InvoicerApplication

fun main(args: Array<String>) {
    runApplication<InvoicerApplication>(*args)
}
