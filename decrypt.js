const fs = require("node:fs");
const crypto = require("node:crypto");
const { pipeline } = require("node:stream");
const path = require("node:path");
const { input } = require("@inquirer/prompts");

(async () => {
  const password = process.env.CRYPTO_TOOL_PASSKEY;

  const savedEncryptedFile = await input({
    message: "Enter name for encrypted file:",
  });

  const decryptedFileName = await input({
    message: "Enter name for decrypted file:",
  });

  // const savedEncryptedFile = process.argv[2];
  // const decryptedFileName = process.argv[3];
  const algorithm = "aes-256-gcm";

  const encryptedDir = path.join(__dirname, "encrypted");
  const decryptedDir = path.join(__dirname, "decrypted");

  // Ensure the directories exist before doing any file operations
  fs.mkdirSync(encryptedDir, { recursive: true });
  fs.mkdirSync(decryptedDir, { recursive: true });

  let fileDesc = fs.openSync(`${encryptedDir}/${savedEncryptedFile}`, "r");

  if (decryptedFileName === undefined) {
    return console.log(
      "please provide name and format (filename.format) for decrypted file ",
    );
  }
  const fileSize = fs.fstatSync(fileDesc).size;

  const salt = Buffer.alloc(16); // salt for key derivation function
  const iv = Buffer.alloc(12);
  const authCode = Buffer.alloc(16);

  /**
   * First sixteen bytes is for the salt
   * Second twelve bytes is for the iv
   * Everything in between is the cipher text
   * Last sixteen bytes is for the Message auth code(MAC)
   */

  // get the salt from encrypted file, the first 16 bytes will have the salt
  fs.readSync(fileDesc, salt, 0, 16, 0);
  //next take the iv from encrypted file. Starting from index 16 and therefrom the next 12 bytes will be the iv key
  fs.readSync(fileDesc, iv, 0, 12, 16);
  //next take the auth code from the last 16 bytes of the encrypted file
  fs.readSync(fileDesc, authCode, 0, 16, fileSize - 16);

  //Password-Based Key Derivation Function 2
  crypto.pbkdf2(password, salt, 1_000_000, 32, "sha512", (err, key) => {
    if (err) return console.error(err);

    const cipher = crypto.createDecipheriv(algorithm, key, iv);

    //Set the MAC for authentication
    cipher.setAuthTag(authCode);

    // Specify where to read the cipher text in the file
    const input = fs.createReadStream(`${encryptedDir}/${savedEncryptedFile}`, {
      start: 28, //excluding the salt + iv. This will only start reading from the 28th byte
      end: fileSize - (16 + 1), // Excluding the MAC which is the last 16 bytes of the file
    });

    const plaintext = fs.createWriteStream(
      `${decryptedDir}/${decryptedFileName}`,
    );

    pipeline(input, cipher, plaintext, (err) => {
      if (err) return console.error(err);

      console.log("File decrypted, and authentication tag verified.");
    });
  });
})();
