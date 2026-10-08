import { settingRepository } from '@/lib/repositories/settingRepository'
import { localStorageService } from './localStorage'
import { s3StorageService } from './s3Storage'
import { r2StorageService } from './r2Storage'
import { bunnyStreamService } from './bunnyStream'
import {
  StorageSettings,
  StorageDriverType,
  UploadResult,
  ChunkInitParams,
  ChunkInitResponse,
  BunnyInitiateResponse,
  VideoPlaybackUrl,
} from './types'

export class StorageManager {
  /**
   * Fetch current storage settings from SQLite settings table
   */
  public getSettings(): StorageSettings {
    const raw = settingRepository.getByType('storage') || {}
    return {
      storage_driver: (raw.storage_driver as StorageDriverType) || 'local',
      aws_access_key_id: (raw.aws_access_key_id as string) || '',
      aws_secret_access_key: (raw.aws_secret_access_key as string) || '',
      aws_default_region: (raw.aws_default_region as string) || 'us-east-1',
      aws_bucket: (raw.aws_bucket as string) || '',
      r2_access_key_id: (raw.r2_access_key_id as string) || '',
      r2_secret_access_key: (raw.r2_secret_access_key as string) || '',
      r2_bucket: (raw.r2_bucket as string) || '',
      r2_endpoint: (raw.r2_endpoint as string) || '',
      r2_public_url: (raw.r2_public_url as string) || '',
      r2_region: (raw.r2_region as string) || 'auto',
      bunny_library_id: (raw.bunny_library_id as string) || '',
      bunny_api_key: (raw.bunny_api_key as string) || '',
      bunny_token_auth_key: (raw.bunny_token_auth_key as string) || '',
    }
  }

  public getActiveDriver(): StorageDriverType {
    const settings = this.getSettings()
    return settings.storage_driver || 'local'
  }

  /**
   * Upload generic files (images, documents, thumbnails) to the active driver.
   * Note: Bunny Stream only hosts video lessons; generic files fall back to local disk.
   */
  public async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    customFilename?: string,
    targetDriver?: StorageDriverType
  ): Promise<UploadResult> {
    const settings = this.getSettings()
    const driver = targetDriver || settings.storage_driver || 'local'

    if (driver === 's3') {
      try {
        return await s3StorageService.uploadBuffer(
          buffer,
          originalFilename,
          mimeType,
          settings,
          customFilename
        )
      } catch (s3Err) {
        console.warn('S3 upload failed, falling back to local storage:', s3Err)
        return await localStorageService.uploadBuffer(
          buffer,
          originalFilename,
          mimeType,
          customFilename
        )
      }
    }

    if (driver === 'r2') {
      try {
        return await r2StorageService.uploadBuffer(
          buffer,
          originalFilename,
          mimeType,
          settings,
          customFilename
        )
      } catch (r2Err) {
        console.warn('R2 upload failed, falling back to local storage:', r2Err)
        return await localStorageService.uploadBuffer(
          buffer,
          originalFilename,
          mimeType,
          customFilename
        )
      }
    }

    // Default to Local Storage
    return await localStorageService.uploadBuffer(
      buffer,
      originalFilename,
      mimeType,
      customFilename
    )
  }

  /**
   * Initiate chunked or direct presigned upload for large video files
   */
  public async initiateChunkedUpload(params: ChunkInitParams): Promise<ChunkInitResponse> {
    const settings = this.getSettings()
    const driver = params.storage || settings.storage_driver || 'local'

    if (driver === 's3' && settings.aws_bucket && settings.aws_access_key_id) {
      try {
        const res = await s3StorageService.initiateMultipart(
          params.filename,
          params.mimetype,
          params.total_chunks,
          settings
        )
        return {
          success: true,
          key: res.key,
          upload_id: res.uploadId,
          aws_upload_id: res.uploadId,
          part_urls: res.partUrls,
          message: 'S3 direct upload initialized',
        }
      } catch (err: any) {
        console.warn('Failed to initiate S3 multipart, falling back to local:', err)
      }
    }

    if (driver === 'r2' && settings.r2_bucket && settings.r2_access_key_id) {
      try {
        const res = await r2StorageService.initiateMultipart(
          params.filename,
          params.mimetype,
          params.total_chunks,
          settings
        )
        return {
          success: true,
          key: res.key,
          upload_id: res.uploadId,
          aws_upload_id: res.uploadId,
          part_urls: res.partUrls,
          message: 'R2 direct upload initialized',
        }
      } catch (err: any) {
        console.warn('Failed to initiate R2 multipart, falling back to local:', err)
      }
    }

    // Local upload fallback: generate local upload ID
    const localUploadId = Date.now()
    return {
      success: true,
      key: `${localUploadId}_${params.filename}`,
      upload_id: localUploadId,
      aws_upload_id: null,
      part_urls: null,
      message: 'Local chunked upload initialized',
    }
  }

  /**
   * Initiate Bunny Stream video
   */
  public async initiateBunnyVideo(title: string): Promise<BunnyInitiateResponse> {
    const settings = this.getSettings()
    return await bunnyStreamService.initiate(title, settings)
  }

  /**
   * Resolve playable lesson URL
   */
  public async resolveLessonVideoUrl(
    srcOrObject: string | { lesson_src?: string | null; disk?: string; key?: string; lesson_provider?: string | null },
    ttlMinutes: number = 60
  ): Promise<VideoPlaybackUrl> {
    const settings = this.getSettings()

    if (typeof srcOrObject === 'string') {
      const src = srcOrObject.trim()
      // If Bunny embed URL or ID
      if (src.includes('iframe.mediadelivery.net')) {
        return { url: src, expiresInSeconds: null, type: 'iframe' }
      }
      if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com')) {
        return { url: src, expiresInSeconds: null, type: 'video' }
      }
      return { url: src, expiresInSeconds: null, type: 'video' }
    }

    const { lesson_src, disk, key, lesson_provider } = srcOrObject

    if (disk === 'bunny' || lesson_provider === 'bunny') {
      const videoId = key || lesson_src || ''
      return bunnyStreamService.getSignedPlaybackUrl(videoId, settings, ttlMinutes)
    }

    if (disk === 's3' && key) {
      try {
        return await s3StorageService.getPresignedPlaybackUrl(key, settings, ttlMinutes)
      } catch {
        return { url: lesson_src || '', expiresInSeconds: null, type: 'video' }
      }
    }

    if (disk === 'r2' && key) {
      try {
        return await r2StorageService.getPresignedPlaybackUrl(key, settings, ttlMinutes)
      } catch {
        return { url: lesson_src || '', expiresInSeconds: null, type: 'video' }
      }
    }

    return {
      url: lesson_src || '',
      expiresInSeconds: null,
      type: 'video',
    }
  }
}

export const storageManager = new StorageManager()
export * from './types'
export { localStorageService } from './localStorage'
export { s3StorageService } from './s3Storage'
export { r2StorageService } from './r2Storage'
export { bunnyStreamService } from './bunnyStream'
