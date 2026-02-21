import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_ALIAS = 'surveilpro_encryption_key';

/**
 * EncryptionService
 * Handles at-rest encryption for health data JSON blobs.
 * Uses expo-crypto for all cryptographic operations (no crypto-js dependency).
 * Keys are stored in Expo SecureStore.
 */
export class EncryptionService {
    private static key: string | null = null;

    /**
     * Converts a hex string to a Uint8Array
     */
    private static hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes;
    }

    /**
     * Converts a Uint8Array to a hex string
     */
    private static bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Converts a string to a Uint8Array (UTF-8)
     */
    private static stringToBytes(str: string): Uint8Array {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }

    /**
     * Converts a Uint8Array to a string (UTF-8)
     */
    private static bytesToString(bytes: Uint8Array): string {
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    }

    /**
     * Initializes or retrieves the encryption key
     */
    private static async getEncryptionKey(): Promise<string> {
        if (this.key) return this.key;

        let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ALIAS);
        if (!key) {
            // Generate a 256-bit key using expo-crypto
            const randomBytes = await Crypto.getRandomBytesAsync(32);
            const seed = this.bytesToHex(randomBytes);
            key = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                seed
            );
            await SecureStore.setItemAsync(ENCRYPTION_KEY_ALIAS, key);
        }

        this.key = key;
        return key;
    }

    /**
     * Generates a keystream of the required length using SHA-256 in counter mode.
     * Each block: SHA256(key + ":" + counter) produces 32 bytes.
     */
    private static async generateKeystream(
        key: string,
        iv: string,
        length: number
    ): Promise<Uint8Array> {
        const keystream = new Uint8Array(length);
        let offset = 0;
        let counter = 0;

        while (offset < length) {
            const block = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                `${key}:${iv}:${counter}`
            );
            const blockBytes = this.hexToBytes(block);
            const remaining = length - offset;
            const toCopy = Math.min(remaining, blockBytes.length);
            keystream.set(blockBytes.subarray(0, toCopy), offset);
            offset += toCopy;
            counter++;
        }

        return keystream;
    }

    /**
     * Encrypts a string using a stream cipher approach:
     * 1. Generate a random IV
     * 2. Generate a keystream from key + IV
     * 3. XOR plaintext with keystream
     * 4. Return IV + ciphertext as hex
     */
    public static async encrypt(data: string): Promise<string> {
        const key = await this.getEncryptionKey();

        // Generate a 16-byte random IV
        const ivBytes = await Crypto.getRandomBytesAsync(16);
        const iv = this.bytesToHex(ivBytes);

        const plainBytes = this.stringToBytes(data);
        const keystream = await this.generateKeystream(key, iv, plainBytes.length);

        // XOR plaintext with keystream
        const cipherBytes = new Uint8Array(plainBytes.length);
        for (let i = 0; i < plainBytes.length; i++) {
            cipherBytes[i] = plainBytes[i] ^ keystream[i];
        }

        // Format: iv (32 hex chars) + ciphertext (hex)
        return iv + this.bytesToHex(cipherBytes);
    }

    /**
     * Decrypts an encrypted hex string back to the original string
     */
    public static async decrypt(encryptedData: string): Promise<string> {
        const key = await this.getEncryptionKey();

        // Extract IV (first 32 hex chars = 16 bytes) and ciphertext
        const iv = encryptedData.substring(0, 32);
        const cipherHex = encryptedData.substring(32);
        const cipherBytes = this.hexToBytes(cipherHex);

        const keystream = await this.generateKeystream(key, iv, cipherBytes.length);

        // XOR ciphertext with keystream to recover plaintext
        const plainBytes = new Uint8Array(cipherBytes.length);
        for (let i = 0; i < cipherBytes.length; i++) {
            plainBytes[i] = cipherBytes[i] ^ keystream[i];
        }

        const decryptedData = this.bytesToString(plainBytes);

        if (!decryptedData) {
            throw new Error('Decryption failed: Invalid key or corrupted data.');
        }

        return decryptedData;
    }

    /**
     * Generates a cryptographic hash for data integrity
     */
    public static async generateHash(data: string): Promise<string> {
        return await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            data
        );
    }

    /**
     * Verifies data integrity against a hash
     */
    public static async verifyIntegrity(
        data: string,
        hash: string
    ): Promise<boolean> {
        const currentHash = await this.generateHash(data);
        return currentHash === hash;
    }
}
