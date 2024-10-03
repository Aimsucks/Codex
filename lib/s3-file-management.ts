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
    bucketName,
    fileName,
    file,
    size,
    contentType,
}: {
    bucketName: string;
    fileName: string;
    file: Buffer | internal.Readable;
    size: number;
    contentType: string;
}) {
    // Create bucket if it doesn't exist
    await createBucketIfNotExists(bucketName);

    const metaData = { 'Content-Type': contentType };

    // Upload image to S3 bucket
    await s3Client.putObject(bucketName, fileName, file, size, metaData);

    return `https://${process.env.S3_URL}/${bucketName}/${fileName}`;
}
