import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../env.js";

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  }
});

export async function checkS3() {
  await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
}
