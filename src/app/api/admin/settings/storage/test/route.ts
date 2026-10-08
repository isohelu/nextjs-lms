import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin', 'instructor'])
    const body = await req.json()
    const { driver, settings } = body

    if (driver === 'local') {
      return NextResponse.json({
        success: true,
        message: 'Local storage is active and ready on server disk.',
      })
    }

    if (driver === 's3') {
      const { aws_access_key_id, aws_secret_access_key, aws_default_region, aws_bucket } = settings || {}
      if (!aws_access_key_id || !aws_secret_access_key || !aws_bucket) {
        return NextResponse.json({
          success: false,
          message: 'Please provide AWS Access Key, Secret Key, and Bucket name to test.',
        })
      }

      if (aws_access_key_id.includes('@')) {
        return NextResponse.json({
          success: false,
          message: 'Invalid AWS Access Key ID: looks like an email address was autofilled by your browser.',
        })
      }

      try {
        const client = new S3Client({
          region: aws_default_region || 'us-east-1',
          credentials: {
            accessKeyId: aws_access_key_id,
            secretAccessKey: aws_secret_access_key,
          },
        })

        // Test bucket accessibility
        await client.send(new HeadBucketCommand({ Bucket: aws_bucket }))

        return NextResponse.json({
          success: true,
          message: `Successfully connected to AWS S3 bucket "${aws_bucket}" in region "${aws_default_region || 'us-east-1'}".`,
        })
      } catch (s3Err: any) {
        return NextResponse.json({
          success: false,
          message: `AWS S3 connection failed: ${s3Err.message || s3Err.name || 'Check credentials and bucket name'}`,
        })
      }
    }

    if (driver === 'r2') {
      const { r2_access_key_id, r2_secret_access_key, r2_bucket, r2_endpoint, r2_region } = settings || {}
      if (!r2_access_key_id || !r2_secret_access_key || !r2_bucket || !r2_endpoint) {
        return NextResponse.json({
          success: false,
          message: 'Please provide R2 Access Key, Secret Key, Bucket, and Endpoint to test.',
        })
      }

      try {
        const endpoint = r2_endpoint.startsWith('http') ? r2_endpoint : `https://${r2_endpoint}`
        const client = new S3Client({
          region: r2_region || 'auto',
          endpoint,
          credentials: {
            accessKeyId: r2_access_key_id,
            secretAccessKey: r2_secret_access_key,
          },
        })

        await client.send(new HeadBucketCommand({ Bucket: r2_bucket }))

        return NextResponse.json({
          success: true,
          message: `Successfully connected to Cloudflare R2 bucket "${r2_bucket}".`,
        })
      } catch (r2Err: any) {
        return NextResponse.json({
          success: false,
          message: `Cloudflare R2 connection failed: ${r2Err.message || r2Err.name || 'Check endpoint and credentials'}`,
        })
      }
    }

    if (driver === 'bunny') {
      const { bunny_library_id, bunny_api_key } = settings || {}
      if (!bunny_library_id || !bunny_api_key) {
        return NextResponse.json({
          success: false,
          message: 'Please provide Bunny Library ID and API Key to test.',
        })
      }

      try {
        const res = await fetch(`https://video.bunnycdn.com/library/${bunny_library_id}/videos?page=1&itemsPerPage=1`, {
          headers: {
            AccessKey: bunny_api_key,
            Accept: 'application/json',
          },
        })

        if (!res.ok) {
          const errText = await res.text()
          return NextResponse.json({
            success: false,
            message: `Bunny Stream API authentication failed (${res.status}): ${errText || 'Invalid API key or Library ID'}`,
          })
        }

        return NextResponse.json({
          success: true,
          message: `Successfully authenticated with Bunny Stream Library #${bunny_library_id}.`,
        })
      } catch (bErr: any) {
        return NextResponse.json({
          success: false,
          message: `Bunny Stream connection failed: ${bErr.message || 'Network error'}`,
        })
      }
    }

    return NextResponse.json({ success: false, message: 'Unknown storage driver' })
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: error.message || 'Test failed' }, { status: 500 })
  }
}
