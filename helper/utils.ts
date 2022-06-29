import * as fs from "fs";
import mkdirp from "mkdirp";
import multer from "multer";
import { IFile } from "../interfaces/IFile";

export const getAllFiles = (dirPath: string, path: any): IFile[] => {
  const _path = dirPath + "/" + path;
  const files = fs.readdirSync(_path);
  let arrayOfFiles: IFile[] = [];

  files.forEach(function (file: string) {
    const stats = fs.statSync(_path + "/" + file);
    arrayOfFiles.push({
      name: file,
      size: stats.size,
      birthtime: stats.birthtime,
      isDirectory: stats.isDirectory(),
      path: stats.isDirectory() ? path + "/" + file : "",
    });
  });
  return arrayOfFiles;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { path = "" } = req.body;
    const _path = globalThis.__dirname + "/" + path;
    mkdirp(_path);
    cb(null, _path);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

export const upload = multer({ storage: storage });

///encryption

import crypto from "crypto";
import { Transform } from "stream";
import logging from "../config/logging";

class AppendInitVect extends Transform {
  appended: Boolean;
  initVect: Buffer;
  constructor(initVect: Buffer, opts?: any) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  _transform(chunk: any, encoding: string, cb: () => void) {
    if (!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

function getCipherKey(password: string) {
  return crypto.createHash("sha256").update(password).digest();
}

interface EncProp {
  filePath: string;
  password: string;
  cb: (arg: Boolean) => void;
}

export const encrypt = ({ filePath, password, cb }: EncProp) => {
  // Generate a secure, pseudo random initialization vector.
  const initVect = crypto.randomBytes(16);
  const CIPHER_KEY = getCipherKey(password);

  const readStream = fs.createReadStream(filePath);
  const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
  const appendInitVect = new AppendInitVect(initVect);
  // Create a write stream with a different file extension.
  const writeStream = fs.createWriteStream(filePath + ".enc");

  readStream.pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  writeStream.on("finish", () => {
    logging.info("Encrypt", "File successfully encrypt");
    fs.unlink(filePath, (err) => {
      if (err) logging.error("Encrypt", "File not deleted!");
    });
    cb(true);
  });
  writeStream.on("error", () => {
    logging.error("Encrypt", "File unable encrypt");
    cb(false);
  });
};

export const decrypt = ({ filePath, password, cb }: EncProp) => {
  // First, get the initialization vector from the file.
  const readInitVect = fs.createReadStream(filePath, { end: 15 });

  let initVect: Buffer | string;
  readInitVect.on("data", (chunk) => {
    initVect = chunk;
  });

  // Once we’ve got the initialization vector, we can decrypt the file.
  readInitVect.on("close", () => {
    const cipherKey = getCipherKey(password);
    const readStream = fs.createReadStream(filePath, { start: 16 });
    const decipher = crypto.createDecipheriv("aes256", cipherKey, initVect);
    const writeStream = fs.createWriteStream(filePath.slice(0, -4));

    readStream.pipe(decipher).pipe(writeStream);
    writeStream.on("finish", () => {
      logging.info("Dicrypt", "File successfully decrypted");
      cb(true);
    });
    writeStream.on("error", () => {
      logging.error("Dicrypt", "File unable decrypted");
      cb(false);
    });
  });
};
