const fs = require("node:fs");
const crypto = require("node:crypto");
const { pipeline } = require("node:stream");
const path = require("node:path");
const { input } = require("@inquirer/prompts");
const Loader = require("./loader");
// Or
// import input from '@inquirer/input';

(async () => {
  const filePath = await input({
    message: "Enter path for file to encrypt:",
  });
  const savedEncryptedFile = await input({
    message: "What will the encrypted files name be:",
  });

  // console.log(process.pid);
  const size = fs.statSync(filePath).size;
  // console.log(`size: ${size}`);

  /**
   * First sixteen bytes is for the salt
   * Second 12 bytes is for the iv
   * Everything in between is the cipher text
   * Last sixteen bytes is for the Message auth code(MAC)
   */

  // const filePath = process.argv[2];
  // const savedEncryptedFile = process.argv[3];

  const encryptedDir = path.join(__dirname, "encrypted");
  const targetedDir = path.join(encryptedDir, `${savedEncryptedFile}.enc`);

  fs.mkdirSync(encryptedDir, { recursive: true });

  const password = process.env.CRYPTO_TOOL_PASSKEY;

  const algorithm = "aes-256-gcm";

  const salt = crypto.randomBytes(16); // salt for key derivation function
  const iv = crypto.randomBytes(12); // best practice is 96 bits for GHASH function to work optimally

  //Password-Based Key Derivation Function 2
  crypto.pbkdf2(password, salt, 1_000_000, 32, "sha512", (err, key) => {
    if (err) return console.error(err);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const plaintext = fs.createReadStream(filePath); //use process.argv[2] to insert file dynamically
    //The below is now the salt + iv + MAC
    console.time("Encrypted in");

    const output = fs.createWriteStream(targetedDir); //use process.argv[3] to name file dynamically

    //* write salt + iv in metadata so that decryption can read it in receiving file and then decrypt successfully

    output.write(salt);
    output.write(iv);

    const loader = new Loader(size, "Encrypting");

    pipeline(plaintext, loader, cipher, output, (err) => {
      if (err) return console.error(err);

      const authCode = cipher.getAuthTag(); // get the message authentication code. 16 bytes inserted at the end of the file
      fs.appendFileSync(targetedDir, authCode);
      console.log(`File encrypted and saved to ${targetedDir}`);
      console.timeEnd("Encrypted in");
    });
  });
})();
