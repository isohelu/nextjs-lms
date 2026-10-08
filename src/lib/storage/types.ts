export type StorageDriverType = 'local' | 's3' | 'r2' | 'bunny'

export interface StorageSettings {
  storage_driver: StorageDriverType
  aws_access_key_id?: string
  aws_secret_access_key?: string
  aws_default_region?: string
  aws_bucket?: string
  r2_access_key_id?: string
  r2_secret_access_key?: string
  r2_bucket?: string
  r2_endpoint?: string
  r2_public_url?: string
  r2_region?: string
  bunny_library_id?: string
  bunny_api_key?: string
  bunny_token_auth_key?: string
}

export interface UploadResult {
  id?: number | null
  url: string
  name: string
  fileName: string
  size: number
  mimeType: string
  disk: StorageDriverType
}

export interface ChunkInitParams {
  filename: string
  mimetype: string
  filesize: number
  filetype: string
  total_chunks: number
  userId?: number
  storage?: StorageDriverType
  course_id?: number | string
  course_section_id?: number | string
}

export interface ChunkInitResponse {
  success: boolean
  key: string
  upload_id: number | string
  aws_upload_id?: string | null
  part_urls?: Array<{ part_number: number; url: string }> | null
  message?: string
}

export interface BunnyInitiateResponse {
  success: boolean
  upload_id: number | string
  video_id: string
  library_id: string
  signature: string
  expire: number
  message?: string
}

export interface VideoPlaybackUrl {
  url: string
  expiresInSeconds?: number | null
  type: 'video' | 'iframe'
}
