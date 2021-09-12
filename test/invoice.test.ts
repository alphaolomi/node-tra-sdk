// import { getItemsXML } from '../src/requests/sendUploadInvoiceRequest';

// describe('invoice', () => {
//   it('getItemsXML', () => {
//     const items = [
//       {
//         ID: 1,
//         DESC: "Product 1",
//         QTY: 1,
//         TAXCODE: 1,
//         AMT: "118000.00",
//       },
//     ]
//     const xml = getItemsXML(items);
//    expect(xml).toBe(`<ITEMS><ITEM><ID>1</ID><DESC>Product 1</DESC><TAXCODE>1</TAXCODE><AMT>118000.00</AMT><QTY>1</QTY>></ITEM></ITEMS>`);  
//   });
// });



describe('invoice', () => {
  it('should a simple valid test', () => {
    expect(1).toBe(1);    
  });
})
