$(document).ready(function () {
  let count = 0;
  let draftOrders = '';
  $.ajax({
    type: 'GET',
    url: `http://localhost:9000/welcome-list`,
    success: function (data) {
      console.log(data);
      draftOrders = data.draft_orders;
      count = data.count;
    },
    error: function () {
      throw new Error('Some error Occoured');
    },
  });
  const ls = window.localStorage;
  let productID = '';
  let medusaCart = ls.getItem('medusaCart');
  $('.add-to-cart , .mwb-product-list__quote-btn').click(function () {
    let dataNode = $(this).closest('div[role="data-node"]');
    productID = dataNode.data('id');
    // let price = parseFloat(dataNode.data('price').replace(/[^\d.]/g, ''));
    // let name = dataNode.data('name');
    // let imageSrc = dataNode.data('image');
    // addToCart(productID, 1, price, name, imageSrc);
    // let spanAdded = $('<span class="mwb-btn">Item Added</span>');
    // spanAdded.click(function () {
    //   window.location.href = '/checkout';
    // });
    // $(this).parent().html(spanAdded);
    // $('#product-added-toast').css('display', 'block');
    // setTimeout(function () {
    //   $('#product-added-toast').css('display', 'none');
    // }, 1000);
    if (medusaCart === null) {
      $.ajax({
        type: 'GET',
        url: `http://localhost:9000/welcome-create`,
        data: {
          id: productID,
        },
        success: function (data) {
          console.log(data);
          ls.setItem('medusaCart', data.draft.id);
        },
        error: function () {
          throw new Error('Some error Occoured');
        },
      });
    }
  });
  // $.ajax({
  //   type: 'GET',
  //   url: `http://localhost:9000/welcome-draft`,
  //   data: {
  //     id: 0,
  //   },
  //   success: function (data) {
  //     console.log(data);
  //     console.log(window.localStorage);
  //   },
  //   error: function () {
  //     throw new Error('Some error Occoured');
  //   },
  // });
});

// $('.add-to-cart , .mwb-product-list__quote-btn').click(function () {
//   let dataNode = $(this).closest('div[role="data-node"]');
//   const productID = dataNode.data('id');
//   let price = parseFloat(dataNode.data('price').replace(/[^\d.]/g, ''));
//   let name = dataNode.data('name');
//   let imageSrc = dataNode.data('image');
//   addToCart(productID, 1, price, name, imageSrc);
//   let spanAdded = $('<span class="mwb-btn">Item Added</span>');
//   spanAdded.click(function () {
//     window.location.href = '/checkout';
//   });
//   $(this).parent().html(spanAdded);
//   $('#product-added-toast').css('display', 'block');
//   setTimeout(function () {
//     $('#product-added-toast').css('display', 'none');
//   }, 1000);
// });
