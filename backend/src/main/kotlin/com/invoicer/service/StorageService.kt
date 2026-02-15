package com.invoicer.service

import com.invoicer.config.SupabaseStorageConfig
import org.slf4j.LoggerFactory
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.multipart.MultipartFile
import java.util.*

@Service
class StorageService(
    private val restTemplate: RestTemplate,
    private val config: SupabaseStorageConfig
) {
    private val logger = LoggerFactory.getLogger(StorageService::class.java)

    fun uploadFile(file: MultipartFile, folder: String = "logos"): String {
        val fileName = generateFileName(file.originalFilename ?: "file")
        val path = "$folder/$fileName"

        val url = "${config.url}/storage/v1/object/${config.storageBucket}/$path"

        val headers = HttpHeaders().apply {
            setBearerAuth(config.serviceKey)
            contentType = MediaType.parseMediaType(file.contentType ?: "application/octet-stream")
        }

        val entity = HttpEntity(file.bytes, headers)

        val response = restTemplate.exchange(url, HttpMethod.POST, entity, String::class.java)

        if (!response.statusCode.is2xxSuccessful) {
            logger.error("Supabase upload failed: ${response.body}")
            throw RuntimeException("Failed to upload file to Supabase Storage")
        }

        return getPublicUrl(path)
    }

    fun deleteFile(fileUrl: String) {
        val path = extractPathFromUrl(fileUrl)

        val url = "${config.url}/storage/v1/object/${config.storageBucket}/$path"

        val headers = HttpHeaders().apply {
            setBearerAuth(config.serviceKey)
        }

        val entity = HttpEntity<Void>(headers)
        restTemplate.exchange(url, HttpMethod.DELETE, entity, String::class.java)
    }

    private fun generateFileName(originalFileName: String): String {
        val extension = originalFileName.substringAfterLast(".", "")
        val uuid = UUID.randomUUID().toString()
        return if (extension.isNotEmpty()) "$uuid.$extension" else uuid
    }

    private fun getPublicUrl(path: String): String {
        return "${config.url}/storage/v1/object/public/${config.storageBucket}/$path"
    }

    private fun extractPathFromUrl(url: String): String {
        val marker = "/storage/v1/object/public/${config.storageBucket}/"
        return url.substringAfter(marker)
    }
}
