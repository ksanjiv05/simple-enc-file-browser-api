const crypto = require("crypto");
const fs = require("fs");

const { Transform } = require('stream');

class AppendInitVect extends Transform {
  constructor(initVect, opts) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  _transform(chunk, encoding, cb) {
    if (!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}









function getCipherKey(password) {
    return crypto.createHash('sha256').update(password).digest();
};

function encrypt( file, password ) {
    // Generate a secure, pseudo random initialization vector.
    const initVect = crypto.randomBytes(16);
    console.log("___random byte ",initVect)
    const CIPHER_KEY = getCipherKey(password);
    console.log("ciper key ",CIPHER_KEY)

    const readStream = fs.createReadStream(file);
    const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect);
    // Create a write stream with a different file extension.
    const writeStream = fs.createWriteStream(file + ".enc");
    
    readStream
      .pipe(cipher)
      .pipe(appendInitVect)
      .pipe(writeStream);
  }


  function decrypt( file, password ) {
    // First, get the initialization vector from the file.
    const readInitVect = fs.createReadStream(file, { end: 15 });
  
    let initVect;
    readInitVect.on('data', (chunk) => {
      initVect = chunk;
    });
  
    // Once we’ve got the initialization vector, we can decrypt the file.
    readInitVect.on('close', () => {
      console.log("___random byte ",initVect)
      const cipherKey = getCipherKey(password);
      console.log("ciper key ",cipherKey)
      const readStream = fs.createReadStream(file, { start: 16 });
      const decipher = crypto.createDecipheriv('aes256', cipherKey, initVect);
      const writeStream = fs.createWriteStream(file + 'next.png');
  
      readStream
        .pipe(decipher)
        .pipe(writeStream);
    });
  }

  decrypt("./chartmethod.PNG.enc","12345678")