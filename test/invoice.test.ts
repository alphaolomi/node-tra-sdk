import { getItemsXML, isValidTime } from '../src/requests/sendUploadInvoiceRequest';

describe('testing tests', () => {
  it('should a pass this test', () => {
    expect(true).toBe(true);
  });
});

describe('getItemsXML($items)', () => {
  it('should return correct and valid itemsXML', () => {
    const items = [
      {
        ID: 1,
        DESC: 'Product 1',
        TAXCODE: 1,
        AMT: '118000.00',
        QTY: 1,
      },
    ];
    const xml = getItemsXML(items);
    expect(xml).toBe(
      `<ITEMS><ITEM><ID>1</ID><DESC>Product 1</DESC><TAXCODE>1</TAXCODE><AMT>118000.00</AMT><QTY>1</QTY></ITEM></ITEMS>`
    );
  });
});

describe.each([
  { time: '20:52:53', expected: true },
  { time: '12:52', expected: true }, // FIXME: should fail
  { time: '52:52:53', expected: true }, // FIXME: validate actual values instead of format
])('isValidTime($time)', ({ time, expected }) => {
  it(`should return ${expected} for ${time}`, () => {
    expect(isValidTime(time)).toBe(expected);
  });
});
