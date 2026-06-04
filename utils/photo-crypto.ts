import * as Crypto from 'expo-crypto';
import { gcm } from '@noble/ciphers/aes.js';

const V2_MAGIC = new Uint8Array([0x46, 0x54, 0x32]); // "FT2"
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;
const LEGACY_NONCE_LENGTH = 16;

const concatBytes = (...parts: Uint8Array[]): Uint8Array => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
};

const xorBytes = (left: Uint8Array, right: Uint8Array) => {
  const output = new Uint8Array(left.length);
  for (let i = 0; i < left.length; i += 1) {
    output[i] = left[i] ^ right[i];
  }
  return output;
};

const isV2Payload = (payload: Uint8Array) =>
  payload.length > V2_MAGIC.length + NONCE_LENGTH + TAG_LENGTH &&
  payload[0] === V2_MAGIC[0] &&
  payload[1] === V2_MAGIC[1] &&
  payload[2] === V2_MAGIC[2];

const deriveLegacyKeystream = async (key: Uint8Array, nonce: Uint8Array, length: number) => {
  const blockSize = 4096;
  const blocks = Math.ceil(length / blockSize);
  const output = new Uint8Array(length);
  let offset = 0;

  for (let index = 0; index < blocks; index += 1) {
    const counter = new Uint8Array(4);
    counter[0] = (index >>> 24) & 255;
    counter[1] = (index >>> 16) & 255;
    counter[2] = (index >>> 8) & 255;
    counter[3] = index & 255;
    const seed = concatBytes(key, nonce, counter);
    const digest = await Crypto.digest(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Uint8Array.from(seed)
    );
    const block = new Uint8Array(digest);
    const slice = block.slice(0, Math.min(block.length, length - offset));
    output.set(slice, offset);
    offset += slice.length;
  }

  return output;
};

const encryptLegacy = async (data: Uint8Array, key: Uint8Array) => {
  const nonce = await Crypto.getRandomBytesAsync(LEGACY_NONCE_LENGTH);
  const keystream = await deriveLegacyKeystream(key, nonce, data.length);
  return concatBytes(nonce, xorBytes(data, keystream));
};

const decryptLegacy = async (payload: Uint8Array, key: Uint8Array) => {
  const nonce = payload.slice(0, LEGACY_NONCE_LENGTH);
  const encrypted = payload.slice(LEGACY_NONCE_LENGTH);
  const keystream = await deriveLegacyKeystream(key, nonce, encrypted.length);
  return xorBytes(encrypted, keystream);
};

const encryptV2 = async (data: Uint8Array, key: Uint8Array) => {
  const nonce = await Crypto.getRandomBytesAsync(NONCE_LENGTH);
  const aes = gcm(key, nonce);
  const ciphertext = aes.encrypt(data);
  return concatBytes(V2_MAGIC, nonce, ciphertext);
};

const decryptV2 = (payload: Uint8Array, key: Uint8Array) => {
  const body = payload.slice(V2_MAGIC.length);
  const nonce = body.slice(0, NONCE_LENGTH);
  const ciphertext = body.slice(NONCE_LENGTH);
  const aes = gcm(key, nonce);
  return aes.decrypt(ciphertext);
};

export const encryptPhotoBytes = async (data: Uint8Array, key: Uint8Array): Promise<Uint8Array> =>
  encryptV2(data, key);

export const decryptPhotoBytes = async (payload: Uint8Array, key: Uint8Array): Promise<Uint8Array> => {
  if (isV2Payload(payload)) {
    return decryptV2(payload, key);
  }
  return decryptLegacy(payload, key);
};
