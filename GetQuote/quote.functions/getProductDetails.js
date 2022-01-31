const axios = require('axios');
const _ = require('lodash');

const hubApiUrl = `https://api.hubapi.com/crm-objects/v1/objects/products/`;

const productQuery = `
  &properties=name
  &properties=image
  &properties=description
  &properties=price
  &properties=createdate
`;

const {apikey} = process.env;

const productRoute = (productId) => {
  return `${hubApiUrl}${productId}?hapikey=${apikey}${productQuery}`;
}

exports.main = async (context, sendResponse) => {
   if (!apikey) {
    sendResponse({
      statusCode: 403,
      body: { message: 'API key not present' },
    });
  }
  let productId = parseInt(context.params.productID);
  try{
    if(! isNaN(productId)){
      const res  = await axios.get(productRoute(productId));
      sendResponse({body: JSON.stringify(res.data) , statusCode: 200});  
    } else {
      throw new Error("Product Id must be an integer");
    }
  } catch(err){
    sendResponse({body: JSON.stringify(process.env) , statusCode: 500});  
  }
}