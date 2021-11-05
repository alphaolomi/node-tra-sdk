const {getItemsXML,getPaymentsXML,getTotalsXML,getVATTotalsXML  } = require('./dist/index');

// getItemsXML

// getTotalsXML

// getPaymentsXML

// getVATTotalsXML
const rec = {
    tin: 'YOUR TIN',
    // signKey: key, // key loaded from first step
    certSerial: 'YOUR CERT SERIAL',
    token: 'YOUR TOKEN',
    routingKey: 'ROUTING KEY FROM REGISTRATION API',
    // hostname: hostname,
    // path: path,
    date: '2021-02-03',
    time: '20:52:53',
    regId: 'REGID_FROM_REGISTRATION_API',
    efdSerial: 'EFDSERIAL_FROM_REGISTRATION_API',
    receiptCode: 'RECEIPTCODE_FROM_REGISTRATION_API',
    rctNum: '10103',
    zNum: '20210203',
    dc: '1',
    gc: '10103',
    customerId: '',
    customerIdType: '6',
    customerName: 'John Doe',
    mobileNumber: '255755123123',
  items: [
    {
      ID: 1,
      DESC: 'Product 1',
      QTY: 1,
      TAXCODE: 1,
      AMT: '118000.00',
    },
  ],
  totals: {
    TOTALTAXEXCL: '100000.00',
    TOTALTAXINCL: '118000.00',
    DISCOUNT: '0.00',
  },
  payments: {
    PMTTYPE: 'EMONEY',
    PMTAMOUNT: '118000.00',
  },
  vatTotals: {
    VATRATE: 'A',
    NETTAMOUNT: '100000.00',
    TAXAMOUNT: '18000.00',
  },
};

// create function to format xml
const formatXML = (xml) => {
    const reg = /(>)(<)(\/*)/g;
    const wsexp = / *(.*) +\n/g;
    const contexp = /(<.+>)(.+\n)/g;
    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
    let formatted = '';
    let pad = 0;
    const lines = xml.split('\n');
    let indent = 0;
    let lastType = 'other';
    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
    const transitions = {
        'single->single': 0,
        'single->closing': -1,
        'single->opening': 0,
        'single->other': 0,
        'closing->single': 0,
        'closing->closing': -1,
        'closing->opening': 0,
        'closing->other': 0,
        'opening->single': 1,
        'opening->closing': 0,
        'opening->opening': 1,
        'opening->other': 1,
        'other->single': 0,
        'other->closing': -1,
        'other->opening': 0,
        'other->other': 0,
    };

    for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        // console.log(ln);
        const single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
        const closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
        const opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
        const type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
        let fromTo = lastType + '->' + type;
        lastType = type;
        let padding = '';
        
        indent += transitions[fromTo];
        for (let j = 0; j < indent; j++) {
            padding += '\t';
        }
        if (fromTo === 'opening->closing') {
            formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
        } else {
            formatted += padding + ln + '\n';
        }
    }

    return formatted;
};


const itemsXML = getItemsXML(rec.items);
// console.log(formatXML(itemsXML,true,2));
  const totalsXML = getTotalsXML(rec.totals);
  const paymentsXML = getPaymentsXML(rec.payments);
  const vatTotalsXML = getVATTotalsXML(rec.vatTotals);

  const rctData = `<RCT><DATE>2021-01-31</DATE><TIME>01:50:59</TIME><TIN>${rec.tin}</TIN><REGID>${rec.regId}</REGID><EFDSERIAL>${rec.efdSerial}</EFDSERIAL><CUSTIDTYPE>${rec.customerIdType}</CUSTIDTYPE><CUSTID>${rec.customerId}</CUSTID><CUSTNAME>${rec.customerName}</CUSTNAME><MOBILENUM>${rec.mobileNumber}</MOBILENUM><RCTNUM>${rec.rctNum}</RCTNUM><DC>${rec.dc}</DC><GC>${rec.gc}</GC><ZNUM>${rec.zNum}</ZNUM><RCTVNUM>${rec.receiptCode}${rec.gc}</RCTVNUM>${itemsXML}${totalsXML}${paymentsXML}${vatTotalsXML}</RCT>`;
//   const signature = await createSignature(signKey, rctData);


  const postData = `<?xml version="1.0" encoding="UTF-8"?><EFDMS>${rctData}<EFDMSSIGNATURE>123412341</EFDMSSIGNATURE></EFDMS>`;

  console.log(formatXML(postData));
