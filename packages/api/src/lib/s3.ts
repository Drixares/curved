import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function createS3Client() {
  const region = process.env.AWS_REGION || 'eu-north-1'

  // If explicit credentials are provided via env, use them
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  // Otherwise fall back to default credential chain (~/.aws/credentials, IAM role, etc.)
  return new S3Client({ region })
}

let _s3: S3Client | null = null
function getS3() {
  if (!_s3) _s3 = createS3Client()
  return _s3
}

function getBucket() {
  const bucket = process.env.S3_ASSETS_BUCKET
  if (!bucket) {
    throw new Error('S3_ASSETS_BUCKET environment variable is not set')
  }
  return bucket
}

export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(getS3(), command, { expiresIn: 600 })
}

export async function getPresignedDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  })
  return getSignedUrl(getS3(), command, { expiresIn: 3600 })
}

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  })
  await getS3().send(command)
}
