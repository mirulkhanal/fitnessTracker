const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export const bytesToBase64 = (bytes: Uint8Array): string => {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triplet = (byte1 << 16) | (byte2 << 8) | byte3;
    output += BASE64_ALPHABET[(triplet >> 18) & 63];
    output += BASE64_ALPHABET[(triplet >> 12) & 63];
    output += i + 1 < bytes.length ? BASE64_ALPHABET[(triplet >> 6) & 63] : '=';
    output += i + 2 < bytes.length ? BASE64_ALPHABET[triplet & 63] : '=';
  }
  return output;
};

export const base64ToBytes = (base64: string): Uint8Array => {
  const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
  const byteLength = (cleaned.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);
  let byteIndex = 0;

  for (let i = 0; i < cleaned.length; i += 4) {
    const enc1 = BASE64_ALPHABET.indexOf(cleaned[i]);
    const enc2 = BASE64_ALPHABET.indexOf(cleaned[i + 1]);
    const enc3 = BASE64_ALPHABET.indexOf(cleaned[i + 2]);
    const enc4 = BASE64_ALPHABET.indexOf(cleaned[i + 3]);
    const block =
      ((enc1 & 63) << 18) |
      ((enc2 & 63) << 12) |
      (((enc3 >= 0 ? enc3 : 0) & 63) << 6) |
      ((enc4 >= 0 ? enc4 : 0) & 63);

    if (byteIndex < byteLength) bytes[byteIndex++] = (block >> 16) & 255;
    if (byteIndex < byteLength) bytes[byteIndex++] = (block >> 8) & 255;
    if (byteIndex < byteLength) bytes[byteIndex++] = block & 255;
  }

  return bytes;
};
