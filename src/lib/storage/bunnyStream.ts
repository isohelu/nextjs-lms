import crypto from 'crypto'
import { StorageSettings, BunnyInitiateResponse, VideoPlaybackUrl } from './types'

export class BunnyStreamService {
  private apiBase = 'https://video.bunnycdn.com'

  /**
   * Initiate video creation on Bunny Stream for direct TUS upload
   */
  public async initiate(
    title: string,
    settings: StorageSettings
  ): Promise<BunnyInitiateResponse> {
    const libraryId = settings.bunny_library_id
    const apiKey = settings.bunny_api_key

    if (!libraryId || !apiKey) {
      throw new Error('Bunny Stream is not fully configured (missing library ID or API key)')
    }

    const res = await fetch(`${this.apiBase}/library/${libraryId}/videos`, {
      method: 'POST',
      headers: {
        AccessKey: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to create video on Bunny Stream: ${errorText}`)
    }

    const data = await res.json()
    const videoId = data.guid as string

    if (!videoId) {
      throw new Error('Bunny Stream response did not contain video guid')
    }

    // Bunny requires at least 1 hour window for TUS upload signature
    const expire = Math.floor(Date.now() / 1000) + 3600
    const signature = crypto
      .createHash('sha256')
      .update(`${libraryId}${apiKey}${expire}${videoId}`)
      .digest('hex')

    return {
      success: true,
      upload_id: videoId,
      video_id: videoId,
      library_id: libraryId,
      signature,
      expire,
    }
  }

  /**
   * Delete a video from Bunny Stream
   */
  public async deleteVideo(videoId: string, settings: StorageSettings): Promise<boolean> {
    const libraryId = settings.bunny_library_id
    const apiKey = settings.bunny_api_key

    if (!libraryId || !apiKey) return false

    try {
      const res = await fetch(`${this.apiBase}/library/${libraryId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          AccessKey: apiKey,
          Accept: 'application/json',
        },
      })

      return res.ok || res.status === 404
    } catch (err) {
      console.error('Error deleting Bunny Stream video:', err)
      return false
    }
  }

  /**
   * Sign a secure playback URL for Bunny Stream iframe embed
   */
  public getSignedPlaybackUrl(
    videoId: string,
    settings: StorageSettings,
    ttlMinutes: number = 60
  ): VideoPlaybackUrl {
    const libraryId = settings.bunny_library_id || ''
    const tokenAuthKey = settings.bunny_token_auth_key || ''

    if (!libraryId) {
      return {
        url: `https://iframe.mediadelivery.net/embed/${videoId}`,
        expiresInSeconds: null,
        type: 'iframe',
      }
    }

    if (!tokenAuthKey) {
      // Direct embed if token auth key is not configured
      return {
        url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
        expiresInSeconds: null,
        type: 'iframe',
      }
    }

    const expires = Math.floor(Date.now() / 1000) + ttlMinutes * 60
    const token = crypto
      .createHash('sha256')
      .update(`${tokenAuthKey}${videoId}${expires}`)
      .digest('hex')

    const url = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`

    return {
      url,
      expiresInSeconds: ttlMinutes * 60,
      type: 'iframe',
    }
  }
}

export const bunnyStreamService = new BunnyStreamService()
