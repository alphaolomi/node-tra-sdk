import { sendRequest } from '../helpers/sendRequest';
import { createSignature } from '../helpers/cryptoHelper';
import convert from 'xml-js';

interface RegistrationRequest {
  tin: string;
  certKey: string;
  signKey: string;
  certSerial: string;
  hostname: string;
  path: string;
}

interface EFDMSRESP {
  ACKCODE?: { _text: string };
  ACKMSG?: { _text: string };
  REGID?: { _text: string };
  SERIAL?: { _text: string };
  UIN?: { _text: string };
  TIN?: { _text: string };
  VRN?: { _text: string };
  MOBILE?: { _text: string };
  STREET?: { _text: string };
  CITY?: { _text: string };
  COUNTRY?: { _text: string };
  NAME?: { _text: string };
  RECEIPTCODE?: { _text: string };
  REGION?: { _text: string };
  ROUTINGKEY?: { _text: string };
  GC?: { _text: string };
  TAXOFFICE?: { _text: string };
  USERNAME?: { _text: string };
  PASSWORD?: { _text: string };
  TOKENPATH?: { _text: string };
}
interface EFDMS {
  EFDMSRESP: EFDMSRESP;
}

export interface IResult {
  EFDMS: EFDMS;
}

/**
 *
 * @param param0
 * @returns
 */
export async function sendRegistrationRequest({
  tin,
  certKey,
  signKey,
  certSerial,
  hostname,
  path,
}: RegistrationRequest){
  const regData = `<REGDATA><CERTKEY>${certKey}</CERTKEY><TIN>${tin}</TIN></REGDATA>`;
  const signature = await createSignature(signKey, regData);
  const postData = `<EFDMS>${regData}<EFDMSSIGNATURE>${signature}</EFDMSSIGNATURE></EFDMS>`;

  const headers = {
    'Content-Type': 'application/xml',
    'Content-Length': postData.length,
    'Cert-Serial': certSerial,
    Client: 'webapi',
  };

  const response = await sendRequest({
    postData,
    headers,
    hostname,
    path,
    method: 'POST',
  });

  if (response == null) {
    return null;
  }

  const { data } = response;
  if (data != null) {
    var options = { compact: true };
    const result = convert.xml2js(data, options);
    const efdResult = result as IResult;
    const efdResponse = efdResult?.EFDMS?.EFDMSRESP;

    if (efdResponse != null) {
      const resultData = {
        ACKCODE: efdResponse.ACKCODE?._text,
        ACKMSG: efdResponse.ACKMSG?._text,
        REGID: efdResponse.REGID?._text,
        SERIAL: efdResponse.SERIAL?._text,
        UIN: efdResponse.UIN?._text,
        TIN: efdResponse.TIN?._text,
        VRN: efdResponse.VRN?._text,
        MOBILE: efdResponse.MOBILE?._text,
        STREET: efdResponse.STREET?._text,
        CITY: efdResponse.CITY?._text,
        COUNTRY: efdResponse.COUNTRY?._text,
        NAME: efdResponse.NAME?._text,
        RECEIPTCODE: efdResponse.RECEIPTCODE?._text,
        REGION: efdResponse.REGION?._text,
        ROUTINGKEY: efdResponse.ROUTINGKEY?._text,
        GC: efdResponse.GC?._text,
        TAXOFFICE: efdResponse.TAXOFFICE?._text,
        USERNAME: efdResponse.USERNAME?._text,
        PASSWORD: efdResponse.PASSWORD?._text,
        TOKENPATH: efdResponse.TOKENPATH?._text,
      };

      return {
        success: efdResponse.ACKCODE?._text == '0',
        data: resultData,
      };
    }
  }

  return null;
}
