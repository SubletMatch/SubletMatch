// import { useEffect } from "react";

// export default function KeyManager({ userId }: { userId: string }) {
//   useEffect(() => {
//     async function setupKeys() {
//       // 🔒 Prevent duplicate key setup (even across StrictMode remounts)
//       if (localStorage.getItem("keySetupDone") === "true") {
//         console.log("🔁 Key setup already completed. Skipping.");
//         return;
//       }
//       localStorage.setItem("keySetupDone", "true");

//       console.log("🔐 Generating new RSA key pair...");

//       // Step 1: Generate RSA key pair
//       const keyPair = await window.crypto.subtle.generateKey(
//         {
//           name: "RSA-OAEP",
//           modulusLength: 2048,
//           publicExponent: new Uint8Array([1, 0, 1]),
//           hash: "SHA-256"
//         },
//         true,
//         ["encrypt", "decrypt"]
//       );

//       // Step 2: Export and store private key
//       const privKeyData = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
//       const privKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privKeyData)));
//       localStorage.setItem("privateKey", privKeyBase64);
//       console.log("🔑 Private key saved to localStorage");

//       // Step 3: Export public key to SPKI format
//       const pubKeyData = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
//       const pubKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(pubKeyData)));

//       // Step 4: Log fingerprint for debug comparison
//       const keyHash = await window.crypto.subtle.digest("SHA-256", pubKeyData);
//       const fingerprint = Array.from(new Uint8Array(keyHash))
//         .slice(0, 8)
//         .map(b => b.toString(16).padStart(2, "0"))
//         .join("-");
//       console.log("[uploadPublicKey] Public key fingerprint:", fingerprint);

//       // Step 5: Upload public key to backend
//       const res = await fetch("http://localhost:8000/api/v1/keys/upload", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id: userId,
//           public_key: pubKeyBase64
//         })
//       });

//       if (!res.ok) {
//         console.error("❌ Failed to upload public key");
//       } else {
//         console.log("✅ Public key uploaded successfully");
//       }
//     }

//     console.log("🧠 KeyManager mounted");
//     setupKeys();
//   }, [userId]);

//   return null;
// }
