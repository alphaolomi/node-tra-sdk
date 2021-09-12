import { sendRequest } from '../helpers/sendRequest';
import { createSignature } from '../helpers/cryptoHelper';
import convert from 'xml-js';

interface RCTACK {
  ACKCODE?: { _text: string };
  ACKMSG?: { _text: string };
  RCTNUM?: { _text: string };
  DATE?: { _text: string };
  TIME?: { _text: string };
}

interface EFDMS {
  RCTACK: RCTACK;
}

export interface IResult {
  EFDMS: EFDMS;
}

// //////////////
interface Item {
  ID: number;
  DESC: string;
  QTY: number;
  TAXCODE: number;
  AMT: string;
}

interface Total {
  TOTALTAXEXCL: string;
  TOTALTAXINCL: string;
  DISCOUNT: string;
}

interface Payment {
  PMTTYPE: string;
  PMTAMOUNT: string;
}
interface VATTotal {
  VATRATE: string;
  NETTAMOUNT: string;
  TAXAMOUNT: string;
}

interface InvoiceRequest {
  tin: string;
  signKey: string;
  certSerial: string;
  token: string;
  routingKey: string;
  hostname: string;
  path: string;
  date: string;
  time: string;
  regId: string;
  efdSerial: string;
  receiptCode: string;
  rctNum: string;
  zNum: string;
  dc: string;
  gc: string;
  customerId: string;
  customerIdType: string;
  customerName: string;
  mobileNumber: string;
  items: Item[];
  totals: Total;
  payments: Payment;
  vatTotals: VATTotal;
}

/**
 * Send an invoice request to the TRA API
 *
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @version 0.1.0
 * @api public
 * @param {InvoiceRequest} invoiceRequest
 * @returns
 */
export async function sendUploadInvoiceRequest({
  tin,
  signKey,
  certSerial,
  token,
  routingKey,
  hostname,
  path,
  //-- request specific params
  date, // YYYY-MM-DD
  time, // HH:mm:ss
  regId,
  efdSerial,
  receiptCode, //from registration details
  rctNum,
  zNum,
  dc,
  gc,
  customerId,
  customerIdType,
  customerName,
  mobileNumber,
  items,
  totals,
  payments,
  vatTotals,
}: InvoiceRequest) {

  if (!isValidDate(date)) {
    throw new Error(`TRA15: Date is invalid: Use format "YYYY-MM-DD"`);    
  }
  if (!isValidTime(time)) {
    throw new Error(`TRA16: Time is invalid: Use format "HH:mm:ss"`);    
  }
  if (!token) {
    throw new Error(`TRA17: Token is required`);
  }
  

  const itemsXML = getItemsXML(items);
  const totalsXML = getTotalsXML(totals);
  const paymentsXML = getPaymentsXML(payments);
  const vatTotalsXML = getVATTotalsXML(vatTotals);

  const rctData = `<RCT><DATE>${date}</DATE><TIME>${time}</TIME><TIN>${tin}</TIN><REGID>${regId}</REGID><EFDSERIAL>${efdSerial}</EFDSERIAL><CUSTIDTYPE>${customerIdType}</CUSTIDTYPE><CUSTID>${customerId}</CUSTID><CUSTNAME>${customerName}</CUSTNAME><MOBILENUM>${mobileNumber}</MOBILENUM><RCTNUM>${rctNum}</RCTNUM><DC>${dc}</DC><GC>${gc}</GC><ZNUM>${zNum}</ZNUM><RCTVNUM>${receiptCode}${gc}</RCTVNUM>${itemsXML}${totalsXML}${paymentsXML}${vatTotalsXML}</RCT>`;
  const signature = await createSignature(signKey, rctData);

  const postData = `<?xml version="1.0" encoding="UTF-8"?><EFDMS>${rctData}<EFDMSSIGNATURE>${signature}</EFDMSSIGNATURE></EFDMS>`;

  const headers = {
    'Content-Type': 'application/xml',
    Authorization: `Bearer ${token}`,
    'Content-Length': postData.length,
    'Cert-Serial': certSerial,
    'Routing-Key': routingKey,
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
    const efdms = result as IResult;
    const efdResponse = efdms?.EFDMS?.RCTACK;

    if (efdResponse != null) {
      const resultData = {
        ACKCODE: efdResponse.ACKCODE?._text,
        ACKMSG: efdResponse.ACKMSG?._text,
        RCTNUM: efdResponse.RCTNUM?._text,
        DATE: efdResponse.DATE?._text,
        TIME: efdResponse.TIME?._text,
      };

      return {
        success: efdResponse.ACKCODE?._text == '0',
        data: resultData,
      };
    }
  }

  return null;
}

/**
 * NOTE: Order of Keys in the item, seems to matter,
 * otherwise TRA API throws an error
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @api internal
 *
 * @param {Item[]} items
 *
 * @returns string
 */
export function getItemsXML(items: Item[]) {
  let itemsXML = '';
  if (items != null && Array.isArray(items)) {
    items.forEach((item) => {
      let itemXML = '';
      let key: keyof typeof item;
      for (key in item) {
        itemXML += `<${key}>${item[key]}</${key}>`;
      }
      if (itemXML !== '') {
        itemsXML += `<ITEM>${itemXML}</ITEM>`;
      }
    });
    if (itemsXML !== '') {
      itemsXML = `<ITEMS>${itemsXML}</ITEMS>`;
    }
  }

  return itemsXML;
}

/**
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @api internal
 * @param {Total} totals
 * @returns string
 */
export function getTotalsXML(totals: Total) {
  let totalsXML = '';

  if (totals != null && typeof totals === 'object') {
    let key: keyof typeof totals;
    for (key in totals) {
      totalsXML += `<${key}>${totals[key]}</${key}>`;
    }
    if (totalsXML !== '') {
      totalsXML = `<TOTALS>${totalsXML}</TOTALS>`;
    }
  }

  return totalsXML;
}

/**
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @api internal
 * @param {Payment} payments
 * @returns string
 */
export function getPaymentsXML(payments: Payment) {
  let paymentsXML = '';

  if (payments != null && typeof payments === 'object') {
    let key: keyof typeof payments;
    for (key in payments) {
      paymentsXML += `<${key}>${payments[key]}</${key}>`;
    }

    if (paymentsXML !== '') {
      paymentsXML = `<PAYMENTS>${paymentsXML}</PAYMENTS>`;
    }
  }

  return paymentsXML;
}

/**
 * @author Alpha Olomi <hello@alphaolomi.com>
 * @api internal
 * @param vatTotals
 * @returns
 */
export function getVATTotalsXML(vatTotals: VATTotal) {
  let vatTotalsXML = '';

  if (vatTotals != null && typeof vatTotals === 'object') {
    let key: keyof typeof vatTotals;
    for (key in vatTotals) {
      vatTotalsXML += `<${key}>${vatTotals[key]}</${key}>`;
    }

    if (vatTotalsXML !== '') {
      vatTotalsXML = `<VATTOTALS>${vatTotalsXML}</VATTOTALS>`;
    }
  }

  return vatTotalsXML;
}

/**
 * Validates the input date string
 *
 * @author Alpha Olomi <hello@alphaoloi.com>
 * * @api internal
 * @param {string} input
 * @returns boolean
 */
export function isValidDate(input: string): boolean {
  let regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/i;
  return regex.test(input);
}

/**
 * Validates the input time string
 * @author Alpha Olomi <hello@alphaoloi.com>
 * @api internal
 *
 * @param {string} input
 * @returns boolean
 */
export function isValidTime(input: string): boolean {
  let regex = /([0-9]+(:[0-9]+)+)/i;
  return regex.test(input);
}


