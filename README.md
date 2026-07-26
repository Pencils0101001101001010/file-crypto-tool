# Node.js File Encryption Utility

A lightweight, secure command-line tool written in Node.js to encrypt and decrypt files using the AES-256-GCM authenticated encryption algorithm.
This project uses modern Node.js streams and native cryptographic modules to securely handle large files without exhausting system memory.

## Security FeaturesAuthenticated Encryption:

Uses aes-256-gcm to guarantee both data confidentiality and integrity (tamper-proofing).
Strong Key Derivation: Derives a 32-byte key from your password using PBKDF2 with 1,000,000 iterations and a cryptographically secure random salt.
No Hardcoded Secrets: Uses system environment variables to handle passwords securely.
Unique Nonces: Generates a fresh Initialization Vector (IV) and Salt for every encryption session.

## Project Layout

All files are processed dynamically relative to the root directory of this script. The necessary folders are automatically generated on execution if they do not exist.

- encrypt.js (Encryption script)

- decrypt.js (Decryption script)

- README.md (Documentation)

- .gitignore (Git exclusion rules)

- encrypted/ (Automatically created. Contains output .enc files)

- decrypted/ (Automatically created. Contains recovered files)

## Step-by-Step Setup and Usage.

1. ### Initialize Your Project Directory
   Create a dedicated folder on your computer and open it in your code editor or terminal.

- mkdir file-crypto-tool
- cd file-crypto-tool.
- run npm install

2. ### Set the Password Environment VariableThe application requires an environment variable named CRYPTO_TOOL_PASSKEY to be set on your operating system.
   Run the appropriate command in your terminal to set it up for your curren session:

export CRYPTO_TOOL_PASSKEY="your_secret_passphrase_here"

3. ### Encrypt a File
   To encrypt an existing file, run node encrypt.js, then it will prompt you to enter the path to the file and a name for the newly encrypted file. All encrypted files will be saved with the format .enc

Result: An encrypted binary file containing the Salt, IV, Ciphertext, and Authentication Tag will be safely stored at ./encrypted/secure_vault.enc.

4. ### Decrypt a File
   To decrypt a file, run node decrypt.js, it will prompt you to enter the name of the encrypted file (example.enc), and the name of the newly decrypted file and relative format e.g example.pdf.

Result: The script will verify the integrity tag, validate the payload, and output the original file to ./decrypted/recovered_document.pdf.

## Technical File Structure Specification

When files are encrypted, they are packed sequentially into a single binary file according to this format payload layout:

- Bytes 0 to 16: Key Derivation Function Salt (Length: 16 bytes)
- Bytes 16 to 28: AES-GCM Initialization Vector (Length: 12 bytes)
- Bytes 28 to File Size minus 16: Encrypted Ciphertext stream (Variable length)
- Last 16 bytes of the file: GCM Message Authentication Tag / MAC (Length: 16 bytes)
