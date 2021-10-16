import crypto from 'crypto';
import pem from 'pem';

/**
 * Create signature for given message with given key
 *
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @version 0.1.0
 * @api public
 *
 * @param {string} key
 * @param {string} message
 *
 * @returns string
 */
export async function createSignature(key: string, message: string): Promise<string> {
  const signature = crypto.sign('sha1', Buffer.from(message), {
    key: key,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  });
  return signature.toString('base64');
}

/**
 * Verify signature for given message with given key
 *
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @version 0.1.0
 * @api public
 *
 * @param {string} publicKey
 * @param {string} message
 * @param signature
 *
 * @returns boolean
 */
export async function verifySignature(
  publicKey: string,
  message: string,
  signature: NodeJS.ArrayBufferView
): Promise<boolean> {
  return crypto.verify(
    'sha1',
    Buffer.from(message),
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    signature
  );
}

interface KeyCertificate {
  key: string;
  cert: string;
  certSerial: String;
}

/**
 *
 * requires Node.js >= v15.6.0
 * @param filePath
 * @param password
 * @returns
 */
export async function loadKeyCertificate(filePath: string, password: string): Promise<KeyCertificate> {
  return new Promise((resolve, reject) => {
    pem.readPkcs12(filePath, { p12Password: password }, (err, result) => {
      if (err != null) {
        reject(err);
      } else {
        const x509 = new crypto.X509Certificate(result.cert);
        resolve({ key: result.key, cert: result.cert, certSerial: x509.serialNumber });
      }
    });
  });
}
