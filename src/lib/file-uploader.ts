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
    const { originalname, mimetype } = file;
    const fileExtension = originalname.split('.').pop();
    const fileName = `${`${options?.path}/` || ''}${
      options?.fileName || originalname
    }_${Date.now()}.${fileExtension}`;
    const bucket = admin.storage().bucket();
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: mimetype,
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
