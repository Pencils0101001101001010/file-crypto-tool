#Node.js File Encryption Utility
A lightweight, secure command-line tool written in Node.js to encrypt and decrypt files using the AES-256-GCM authenticated encryption algorithm.
This project uses modern Node.js streams and native cryptographic modules to securely handle large files without exhausting system memory.

Security FeaturesAuthenticated Encryption: Uses aes-256-gcm to guarantee both data confidentiality and integrity (tamper-proofing).
Strong Key Derivation: Derives a 32-byte key from your password using PBKDF2 with 1,000,000 iterations and a cryptographically secure random salt.
No Hardcoded Secrets: Uses system environment variables to handle passwords securely.
Unique Nonces: Generates a fresh Initialization Vector (IV) and Salt for every encryption session.

Project LayoutAll files are processed dynamically relative to the root directory of this script. The necessary folders are automatically generated on execution if they do not exist.

encrypt.js (Encryption script)

decrypt.js (Decryption script)

README.md (Documentation)

.gitignore (Git exclusion rules)

encrypted/ (Automatically created. Contains output .enc files)

decrypted/ (Automatically created. Contains recovered files)

Step-by-Step Setup and Usage.

1.Initialize Your Project Directory
Create a dedicated folder on your computer and open it in your code editor or terminal.

mkdir file-crypto-tool
cd file-crypto-tool.

2.Configure Git Protections (Crucial for GitHub)
To ensure your encrypted and decrypted files never get accidentally pushed to GitHub, create a file named .gitignore in the root of your project folder and add these lines: encrypted/ decrypted/

3.Set the Password Environment VariableThe application requires an environment variable named CRYPTO_TOOL_PASSKEY to be set on your operating system.
Run the appropriate command in your terminal to set it up for your curren session:

export CRYPTO_TOOL_PASSKEY="your_secret_passphrase_here"

4.Encrypt a File
To encrypt an existing file, provide the path to the target file, followed by your desired name for the output file.

node encrypt.js /path/to/my_document.pdf secure_vault

Result: An encrypted binary file containing the Salt, IV, Ciphertext, and Authentication Tag will be safely stored at ./encrypted/secure_vault.enc.

5.Decrypt a File
To decrypt a file, provide the full filename located inside your ./encrypted/ folder, followed by your desired output filename and extension.

node decrypt.js secure_vault.enc recovered_document.pdf

Result: The script will verify the integrity tag, validate the payload, and output the original file to ./decrypted/recovered_document.pdf.

Technical File Structure Specification
When files are encrypted, they are packed sequentially into a single binary file according to this format payload layout:

Bytes 0 to 16: Key Derivation Function Salt (Length: 16 bytes)
Bytes 16 to 28: AES-GCM Initialization Vector (Length: 12 bytes)
Bytes 28 to File Size minus 16: Encrypted Ciphertext stream (Variable length)
Last 16 bytes of the file: GCM Message Authentication Tag / MAC (Length: 16 bytes)
