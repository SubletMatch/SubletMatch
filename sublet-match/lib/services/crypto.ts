// export async function decryptMessage(encryptedMessage: string): Promise<string> {
//     if (!encryptedMessage.startsWith("ENCRYPTED:")) return encryptedMessage;
  
//     try {
//       const encryptedPayload = encryptedMessage.replace("ENCRYPTED:", "");
//       const { aes, iv, ciphertext } = JSON.parse(atob(encryptedPayload));
  
//       console.log("[decryptMessage] Parsed payload:", { aes, iv, ciphertext });
  
//       // Get private key from localStorage
//       const privateKeyRaw = localStorage.getItem("privateKey");
//       if (!privateKeyRaw) throw new Error("No private key in localStorage");
//       console.log("[decryptMessage] Retrieved key from localStorage");
  
//       // Determine if the stored key is in PEM format or raw base64
//       let pemContents;
//       const pemHeader = "-----BEGIN PRIVATE KEY-----";
//       const pemFooter = "-----END PRIVATE KEY-----";
  
//       if (privateKeyRaw.includes(pemHeader)) {
//         // Key is in PEM format, extract the base64 content
//         pemContents = privateKeyRaw
//           .replace(pemHeader, "")
//           .replace(pemFooter, "")
//           .replace(/\s+/g, "");
//         console.log("[decryptMessage] Found key in PEM format");
//       } else {
//         // Key is already in raw base64 format
//         pemContents = privateKeyRaw;
//         console.log("[decryptMessage] Found key in raw base64 format");
//       }
  
//       // Convert base64 to binary
//       const binaryDerString = atob(pemContents);
//       const binaryDer = new Uint8Array(binaryDerString.length);
//       for (let i = 0; i < binaryDerString.length; i++) {
//         binaryDer[i] = binaryDerString.charCodeAt(i);
//       }
//       // 🔐 Fingerprint the private key bytes (not the CryptoKey object)
//       const keyHash = await window.crypto.subtle.digest("SHA-256", binaryDer.buffer);
//       const fingerprint = Array.from(new Uint8Array(keyHash))
//         .slice(0, 8)
//         .map(b => b.toString(16).padStart(2, '0'))
//         .join("-");
//       console.log("[decryptMessage] Private key fingerprint:", fingerprint);

  
//       // Import the private key
//       const privateKey = await window.crypto.subtle.importKey(
//         "pkcs8",
//         binaryDer.buffer,
//         { name: "RSA-OAEP", hash: "SHA-256" },
//         false,
//         ["decrypt"]
//       );
//       console.log("[decryptMessage] Private RSA key imported successfully");
  
//       // Decrypt the AES key with RSA
//       const encryptedKeyBuffer = Uint8Array.from(atob(aes), c => c.charCodeAt(0));
//       console.log("[decryptMessage] Encrypted AES key length:", encryptedKeyBuffer.length);
//       console.log("AES key base64 string (aes):", aes);

//       let aesKeyBuffer;
//       try {
//         aesKeyBuffer = await window.crypto.subtle.decrypt(
//           { name: "RSA-OAEP", hash: "SHA-256" },
//           privateKey,
//           encryptedKeyBuffer
//         );
//         console.log("[decryptMessage] AES key successfully decrypted, length:", aesKeyBuffer.byteLength);
//       } catch (rsaError) {
//         console.error("[decryptMessage] AES decryption with RSA failed:", rsaError);
//         throw new Error("Failed to decrypt AES key with RSA");
//       }
  
//       // Import the AES key
//       const aesKey = await window.crypto.subtle.importKey(
//         "raw",
//         aesKeyBuffer,
//         { name: "AES-GCM", length: 256 },
//         false,
//         ["decrypt"]
//       );
//       console.log("[decryptMessage] AES key imported successfully");
  
//       // Decrypt the message content
//       const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
//       const ciphertextBuffer = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  
//       const decrypted = await window.crypto.subtle.decrypt(
//         { name: "AES-GCM", iv: ivBuffer },
//         aesKey,
//         ciphertextBuffer
//       );
  
//       const decoder = new TextDecoder();
//       return decoder.decode(decrypted);
//     } catch (error) {
//       console.error("[decryptMessage] Decryption error:", error);
//       return "[Decryption failed]";
//     }
//   }
  
//   // Add a utility function to check if private key needs migration
//   export async function checkAndMigratePrivateKey(): Promise<boolean> {
//     const privateKey = localStorage.getItem("privateKey");
//     if (!privateKey) return false;
  
//     const pemHeader = "-----BEGIN PRIVATE KEY-----";
    
//     if (!privateKey.includes(pemHeader)) {
//       // Migrate from raw base64 to PEM format
//       try {
//         const formattedPrivateKey = 
//           "-----BEGIN PRIVATE KEY-----\n" +
//           privateKey.match(/.{1,64}/g)!.join("\n") +
//           "\n-----END PRIVATE KEY-----";
        
//         localStorage.setItem("privateKey", formattedPrivateKey);
//         console.log("Private key migrated to PEM format");
//         return true;
//       } catch (error) {
//         console.error("Failed to migrate private key:", error);
//         return false;
//       }
//     }
    
//     return true; // Key is already in PEM format
//   }