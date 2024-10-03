import * as Minio from 'minio';
import internal from 'node:stream';

// Create a new Minio client with the S3 endpoint, access key, and secret key
export const s3Client = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT || '',
    port: process.env.S3_PORT ? Number(process.env.S3_PORT) : undefined,
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    useSSL: process.env.S3_USE_SSL === 'true',
});

export async function createBucketIfNotExists(bucketName: string) {
    const bucketExists = await s3Client.bucketExists(bucketName);
    if (!bucketExists) {
        await s3Client.makeBucket(bucketName);
    }
}

export async function saveFileInBucket({
    fileName,
    file,
    size,
    contentType,
}: {
    fileName: string;
    file: Buffer | internal.Readable;
    size: number;
    contentType: string;
}) {
    const bucketName = process.env.S3_BUCKET_NAME || 'codex';

    // Create bucket if it doesn't exist
    await createBucketIfNotExists(bucketName);

    const metaData = { 'Content-Type': contentType };

    // Upload image to S3 bucket
    await s3Client.putObject(bucketName, fileName, file, size, metaData);

    return `${process.env.S3_URL}/${bucketName}/${fileName}`;
}
