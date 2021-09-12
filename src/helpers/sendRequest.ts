import { OutgoingHttpHeaders } from 'http';
import https from 'https';

interface SendRequest {
  postData: string;
  headers: OutgoingHttpHeaders;
  method: string;
  hostname: string;
  path: string;
  port?: 443;
}

interface IResponse {
  headers: OutgoingHttpHeaders;
  data: string;
}

// https.RequestOptions
/**
 *
 * @param param0
 * @returns
 */
export async function sendRequest({ postData, headers, method, hostname, path }: SendRequest): Promise<IResponse> {
  postData = postData || '';
  method = method || 'GET';
  hostname = hostname || '';
  path = path || '/';
  headers = headers || {};

  const options: https.RequestOptions = {
    hostname,
    port: 443,
    path,
    method,
    headers,
  };

  return new Promise((resolve, reject) => {
    let data = '';

    const request = https.request(options, response => {
      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          resolve({ headers: response.headers, data });
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', error => {
      reject(error);
    });

    request.write(postData);
    request.end();
  });
}
