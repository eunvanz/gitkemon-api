import * as admin from 'firebase-admin';

export interface UploadFileOptions {
  path: string;
  fileName: string;
}

export const uploadFile: (
  file: Express.Multer.File,
  options?: UploadFileOptions,
) => Promise<string> = (file, options) => {
  return new Promise((resolve, reject) => {
    const fileName = `${options?.path || ''}${
      options?.fileName || file.originalname
    }_${Date.now()}`;
    const bucket = admin.storage().bucket();
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      reject(error);
    });

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
};
