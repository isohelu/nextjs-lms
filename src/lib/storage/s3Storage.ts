import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import path from 'path'
import { StorageSettings, UploadResult, VideoPlaybackUrl } from './types'

export class S3StorageService {
  private getClient(settings: StorageSettings): S3Client {
    const region = settings.aws_default_region || 'us-east-1'
    const accessKeyId = settings.aws_access_key_id || ''
    const secretAccessKey = settings.aws_secret_access_key || ''

    return new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  /**
   * Upload buffer directly to S3
   */
  public async uploadBuffer(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    settings: StorageSettings,
    customFilename?: string
  ): Promise<UploadResult> {
    const bucket = settings.aws_bucket
    if (!bucket || !settings.aws_access_key_id || !settings.aws_secret_access_key) {
      throw new Error('AWS S3 credentials or bucket name are missing in Storage Settings')
    }

    const ext = path.extname(originalFilename) || ''
    const baseName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
    const key = `uploads/${customFilename || `${Date.now()}_${baseName}${ext}`}`

    const client = this.getClient(settings)
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType || 'application/octet-stream',
      })
    )

    const region = settings.aws_default_region || 'us-east-1'
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return {
      url: publicUrl,
      name: originalFilename,
      fileName: key,
      size: buffer.length,
      mimeType: mimeType || 'application/octet-stream',
      disk: 's3',
    }
  }

  /**
   * Initiate S3 multipart upload and return presigned PUT URLs for each chunk
   */
  public async initiateMultipart(
    filename: string,
    mimeType: string,
    totalChunks: number,
    settings: StorageSettings
  ): Promise<{
    uploadId: string
    key: string
    partUrls: Array<{ part_number: number; url: string }>
  }> {
    const bucket = settings.aws_bucket
    if (!bucket) throw new Error('S3 bucket is not configured')

    const client = this.getClient(settings)
    const ext = path.extname(filename) || ''
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
    const key = `uploads/${Date.now()}_${baseName}${ext}`

    const createRes = await client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: mimeType || 'application/octet-stream',
      })
    )

    const uploadId = createRes.UploadId
    if (!uploadId) throw new Error('Failed to create S3 multipart upload')

    const partUrls: Array<{ part_number: number; url: string }> = []

    for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
      const command = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      })
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 7200 })
      partUrls.push({ part_number: partNumber, url: signedUrl })
    }

    return {
      uploadId,
      key,
      partUrls,
    }
  }

  /**
   * Complete S3 multipart upload
   */
  public async completeMultipart(
    key: string,
    uploadId: string,
    parts: Array<{ part_number: number; etag: string }>,
    settings: StorageSettings
  ): Promise<{ url: string; key: string }> {
    const bucket = settings.aws_bucket
    if (!bucket) throw new Error('S3 bucket is not configured')

    const client = this.getClient(settings)
    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
            .sort((a, b) => a.part_number - b.part_number)
            .map((p) => ({
              PartNumber: p.part_number,
              ETag: p.etag,
            })),
        },
      })
    )

    const region = settings.aws_default_region || 'us-east-1'
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return { url: publicUrl, key }
  }

  /**
   * Abort S3 multipart upload
   */
  public async abortMultipart(
    key: string,
    uploadId: string,
    settings: StorageSettings
  ): Promise<boolean> {
    const bucket = settings.aws_bucket
    if (!bucket) return false

    try {
      const client = this.getClient(settings)
      await client.send(
        new AbortMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
        })
      )
      return true
    } catch (err) {
      console.error('Error aborting S3 multipart upload:', err)
      return false
    }
  }

  /**
   * Delete object from S3
   */
  public async deleteFile(key: string, settings: StorageSettings): Promise<boolean> {
    const bucket = settings.aws_bucket
    if (!bucket) return false

    try {
      const client = this.getClient(settings)
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      )
      return true
    } catch (err) {
      console.error('Error deleting S3 object:', err)
      return false
    }
  }

  /**
   * Get temporary presigned URL for playback or download
   */
  public async getPresignedPlaybackUrl(
    key: string,
    settings: StorageSettings,
    ttlMinutes: number = 60
  ): Promise<VideoPlaybackUrl> {
    const bucket = settings.aws_bucket
    if (!bucket) {
      throw new Error('S3 bucket is not configured')
    }

    const client = this.getClient(settings)
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const signedUrl = await getSignedUrl(client, command, { expiresIn: ttlMinutes * 60 })

    return {
      url: signedUrl,
      expiresInSeconds: ttlMinutes * 60,
      type: 'video',
    }
  }
}

export const s3StorageService = new S3StorageService()
