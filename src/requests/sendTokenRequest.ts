import { sendRequest } from '../helpers/sendRequest';
import { URLSearchParams } from 'url';

interface TokenRequest {
  username: string;
  password: string;
  grantType: string;
  hostname: string;
  path: string;
}

/**
 * Send a token request to the server
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @version 0.1.0
 * @api public
 * @param {TokenRequest} tokenRequest
 * @returns
 */
export async function sendTokenRequest({
  username,
  password,
  grantType,
  hostname,
  path,
}: TokenRequest): Promise<{ success: boolean; data: any } | null> {
  const postParams = new URLSearchParams({
    username: username,
    password: password,
    grant_type: grantType,
  });

  const postData = postParams.toString();
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const response = await sendRequest({ postData, headers, hostname: hostname, path: path, method: 'POST' });

  if (response == null) {
    return null;
  }

  const data = response.data;

  if (data != null) {
    return {
      success: false,
      data: null,
    };
  }
  const resultData = JSON.parse(data);

  return {
    success: resultData.error == 'invalid_grant' ? false : true,
    data: resultData,
  };

  return null;
}
