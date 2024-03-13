// import AWS, { AWSError } from "aws-sdk";
import {
  Bucket,
  CreateBucketCommand,
  DeleteObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import Logger from "./utils/logger/logger";

/* --------------------------------------------------------------- */

const bucketName = process.env.AWS_S3_BUCKET_NAME as string;

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

/* --------------------------------------------------------------- */
export const createBucket = async () => {
  const command = new CreateBucketCommand({
    Bucket: bucketName,
  });

  const buckets = await listBuckets();

  if (buckets.some((b: Bucket) => b.Name === bucketName))
    return Logger.info(`S3 Bucket -> ${bucketName}, already exists`);

  try {
    const { Location } = await client.send(command);
    Logger.info(`S3 Bucket created with at: ${Location}`);
  } catch (err) {
    Logger.error(`Error creating S3 Bucket:\n ${err}`);
  }
};

export const uploadImage = async (key: string, image: Buffer) => {
  try {
    const contentType = getImageType(key);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: image,
      StorageClass: "STANDARD",
      ContentType: contentType,
    });

    const response = await client.send(command);
    Logger.info(`Image uploaded successfully to S3 Bucket: \n ${response}`);
  } catch (err) {
    Logger.error(`Error uploading image to S3 Bucket:\n ${err}`);
  }
};

export const deleteImage = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await client.send(command);
    Logger.info(`Image deleted successfully from S3 Bucket:\n ${response}`);
  } catch (err) {
    Logger.error(`Error deleting image from S3 Bucket:\n ${err}`);
  }
};

export const listBuckets = async () => {
  const command = new ListBucketsCommand({});

  const { Buckets } = await client.send(command);
  if (!Buckets || Buckets.length === 0) {
    Logger.warn("No S3 Buckets found");
    return [];
  }

  Logger.debug(`S3 Buckets:`);
  Logger.debug(Buckets.map((bucket) => bucket.Name).join("\n"));
  return Buckets;
};

/* ---------------- Helper Methods ---------------- */
const getImageType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "jpeg" || extension === "jpg") return "image/jpeg";
  else if (extension === "png") return "image/png";
  else throw new Error(`Unsupported file format: ${extension}`);
};
