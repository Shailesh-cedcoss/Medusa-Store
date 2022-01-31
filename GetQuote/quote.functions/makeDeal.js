const axios = require('axios');
const {apikey} = process.env;
let contactEmail = ""
const lineItemsUrl = `https://api.hubapi.com/crm-objects/v1/objects/line_items?hapikey=${apikey}`;
const associationsUrl = `https://api.hubapi.com/crm-associations/v1/associations?hapikey=${apikey}`;
const dealUrl = `https://api.hubapi.com/deals/v1/deal?hapikey=${apikey}`;

//10 days
const dealCloseTime = 10*24*60*60*1000;
var headersOpt = {  
    "content-type": "application/json",
};

const getContactVid = async contactEmail => {
  const contactUrl = `https://api.hubapi.com/contacts/v1/contact/email/${contactEmail}/profile?hapikey=${apikey}`
  const some = await axios.get(contactUrl);
  console.log(some)
  return some;
//   const res = await axios({
//     method: "GET",
//     headers: headersOpt,
//     url: contactUrl,
//   })
//   .catch(err => {
//     console.error("something went wrong, please try again! "+ err)
//   })
  return res
}

const makeLineItems = async (products) => {
  let lineItems = [];
  let promises = [];
  Object.keys(products).forEach((key) => {  
    promises.push(
      axios({
        method: "POST",
        headers: headersOpt,
        url: lineItemsUrl,
        data: products[key],
      }).then(res => {
        lineItems.push(res.data.objectId);     
      })
      .catch(err => {
        // do something
      })
    );
  });
  await Promise.allSettled(promises);
  return lineItems;
}

const makeAssociations = async (dealId, lineItems) => {  
  let promises = []; 
  lineItems.forEach(function(lineItemId){
    promises.push(
      axios({
        method: "PUT",
        headers: headersOpt,
        url: associationsUrl,
        data: {
          "fromObjectId": dealId,
          "toObjectId": lineItemId,
          "category": "HUBSPOT_DEFINED",
          "definitionId": 19
        }
      })
      .catch(err => {
        console.log(err)
      })
    );       
  });  
  await Promise.allSettled(promises);
}

exports.main = async (context, sendResponse) => {    
  let formData = context.body.formData;
  const contactEmail = formData[2].value;
  const contactUrl = `https://api.hubapi.com/contacts/v1/contact/email/${contactEmail}/profile?hapikey=${apikey}`;
  const contactRes = await axios.get(contactUrl)
  .catch(err => {
      sendResponse({body: "Something went wrong" , status: 500});
  })
//   sendResponse({body: JSON.stringify({status: contactRes.status, data: contactRes.data}), status: 200});
  const contactVid = contactRes.data.vid  
  let products = context.body.products;  
  const newDeal = {
    "associations" : {
      "associatedVids" : [
        contactVid  
      ]
    },
    "properties": [
       {
        "value":"Quote request by - "+formData[0].value,
        "name": "dealname"
      },
      {
        "value": "appointmentscheduled",
        "name": "dealstage"
      },
      {
        "value": "default",
        "name": "pipeline"
      },
      {
        "value": "newbusiness",
        "name": "dealtype"
      },
      {
        "value": Date.now()+dealCloseTime,
        "name": "closedate"
      },
      {
        "value": Number(context.body.totalPrice.toFixed(2)),
        "name": "amount"
      },
      {
        "value" : `${formData[0].value} ${formData[1].value} has asked for a new deal and the email is ${formData[2].value}`,
        "name": "description"        
      }
    ]
  };
  
  const res = await axios({
    method: "POST",
    headers: headersOpt,
    url: dealUrl,
    data: newDeal,
  })
  .catch(err => {
    console.error("something went wrong, please try again!")
  })
  await makeAssociations(res.data.dealId, await makeLineItems(products));        
  sendResponse({status: 200});
};