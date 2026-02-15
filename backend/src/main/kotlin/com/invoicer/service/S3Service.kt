package com.invoicer.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.util.*

@Service
class S3Service(
    private val s3Client: S3Client
) {

    @Value("\${aws.s3.bucket-name:}")
    private lateinit var bucketName: String

    @Value("\${aws.s3.region:us-east-1}")
    private lateinit var region: String

    /**
     * Upload file to S3 and return the public URL
     */
    fun uploadFile(file: MultipartFile, folder: String = "logos"): String {
        val fileName = generateFileName(file.originalFilename ?: "file")
        val key = "$folder/$fileName"

        val putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(file.contentType)
            .build()

        s3Client.putObject(
            putObjectRequest,
            RequestBody.fromInputStream(file.inputStream, file.size)
        )

        return getPublicUrl(key)
    }

    /**
     * Delete file from S3
     */
    fun deleteFile(fileUrl: String) {
        val key = extractKeyFromUrl(fileUrl)
        val deleteObjectRequest = DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build()

        s3Client.deleteObject(deleteObjectRequest)
    }

    /**
     * Generate unique file name
     */
    private fun generateFileName(originalFileName: String): String {
        val extension = originalFileName.substringAfterLast(".", "")
        val uuid = UUID.randomUUID().toString()
        return if (extension.isNotEmpty()) "$uuid.$extension" else uuid
    }

    /**
     * Get public URL for the file
     */
    private fun getPublicUrl(key: String): String {
        return "https://$bucketName.s3.$region.amazonaws.com/$key"
    }

    /**
     * Extract S3 key from full URL
     */
    private fun extractKeyFromUrl(url: String): String {
        return url.substringAfter("amazonaws.com/")
    }
}
