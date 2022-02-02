let products = [];
let totalItems = 0;
let totalPrice = 0;
let paymentId = '';
let backToShopHtml = $($('.mwb-pro-details__row--shop')[0].outerHTML).css(
  'display',
  'block'
);
const getCart = draftOrderId => {
  $.ajax({
    type: 'GET',
    url: `http://localhost:9000/add-to-cart?draftOrderId=${draftOrderId}`,
    success: function (data) {
      //   console.log(data);
      renderCart(data.cart, draftOrderId);
    },
    error: function () {
      throw new Error('Some error Occoured');
    },
  });
};

const updateDraftorder = (medusaCart, varaintId, operate) => {
  $.ajax({
    type: 'GET',
    url: `http://localhost:9000/add-to-cart`,
    data: {
      variantId: varaintId,
      draftOrderId: medusaCart,
      operation: operate,
    },

    success: function (data) {
      console.log(data);
    },

    error: function () {
      throw new Error('Some error Occoured');
    },
  });
};

const renderCart = (cart, draftOrderId) => {
  Object.keys(cart.items).forEach(function (item) {
    products.push(cart.items[item]);
  });

  $('#cart-count').text(totalItems);

  $('#cart-table-body').html('');

  Object.keys(products).forEach(function (productID) {
    let productDetails = products[productID];

    let productTotalPrice = Number(
      (productDetails.quantity * productDetails.unit_price).toFixed(2)
    );

    totalPrice += productTotalPrice;

    let productObj = $(
      `<tr role="product" data-id="${productDetails.variant_id}">
              <td>
                //Image
                <span class="mwb-pro-details__name">
                  ${productDetails.title} (${productDetails.variant.title})
                </span>
              </td>
              <td>
                <button class="mwb-quantity-btn minus" role="dec-qty">-</button>
                <span role="quantity">${productDetails.quantity}</span>
                <button class="mwb-quantity-btn plus" role="inc-qty">+</button>
              </td>
              <td class="mwb-pro-details__table-price">
                ${productTotalPrice} $
              </td>
           </tr>
            `
    );
    ++totalItems;
    // productObj.find('button[role="remove-from-cart"]').click(function () {
    //   let count = products[productID][1].value;
    //   let productPrice = products[productID][2].value * count;
    //   delete products[productID];
    //   getProductRow(this).remove();
    //   cartData.totalItems -= count;
    //   cartData.totalPrice -= productPrice;
    //   $('#cart-product-list')
    //     .find('span[role="cart-total-price"]')
    //     .text('Total Price :' + cartData.totalPrice.toFixed(2) + ' $');
    //   $('#cart-count').text(cartData.totalItems);
    // });
    productObj.find('button[role="dec-qty"]').click(function () {
      productDetails.quantity = productDetails.quantity - 1;
      productTotalPrice -= productDetails.unit_price;
      totalPrice -= productDetails.unit_price;
      if (productDetails.quantity === 0) {
        delete products[productID];
        $('#cart-count').text(totalItems);
        $('#cart-total-price').text(
          'Total Price :' + cartData.totalPrice.toFixed(2) + ' $'
        );
        if (cartData.totalItems === 0) {
          $('#cart-container').html(backToShopHtml);
        }
      } else {
        updateDraftorder(draftOrderId, productDetails.variant_id, 'dec');
      }
    });
    // productObj.find('button[role="inc-qty"]').click(function () {
    //   products[productID][1].value = products[productID][1].value + 1;
    //   cartData.totalPrice += products[productID][2].value;
    //   cartData.totalItems += 1;
    //   updateProductInfoCart(
    //     getProductRow(this),
    //     products[productID][1].value,
    //     products[productID][2].value
    //   );
    // });
    $('#cart-table-body').append(productObj);
    if (totalItems === Object.keys(products).length) {
      $('#cart-table-body').append(
        '<tr><td colspan="3" id="cart-total-price">Total Price : ' +
          totalPrice.toFixed(2) +
          ' $</td></tr>'
      );
    }
  });
};

$(document).ready(function () {
  let orderId,
    ls = window.localStorage,
    medusaCart = ls.getItem('medusaCart');
  const draftOrderDetails = medusaCart;

  if (medusaCart) {
    getCart(medusaCart);

    $('#rzp-button1').click(function (e) {
      $.ajax({
        type: 'GET',
        url: `http://localhost:9000/create-payment-order`,
        data: {
          amount: totalPrice,
          draftOrder: draftOrderDetails,
        },
        success: function (data) {
          orderId = data.id;
        },
        error: function () {
          throw new Error('Some error Occoured');
        },
      });

      let options = {
        key: 'rzp_test_dIIyGFY7lcgcVs', // Enter the Key ID generated from the Dashboard
        amount: totalPrice, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: 'INR',
        name: 'Acme Corp',
        description: 'Test Transaction',
        image: 'https://example.com/your_logo',
        order_id: orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: function (response) {
          paymentId = response.razorpay_payment_id;
          changeDraftOrderStatus(draftOrderDetails, paymentId);
          // alert(response.razorpay_order_id);
          // alert(response.razorpay_signature);
        },
        prefill: {
          name: 'Gaurav Kumar',
          email: 'gaurav.kumar@example.com',
          contact: '9999999999',
        },
        notes: {
          address: 'Razorpay Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };

      let rzp1 = new Razorpay(options);

      rzp1.on('payment.failed', function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
      });

      rzp1.open();
      e.preventDefault();
    });
  } else {
    $('#cart-container').html(backToShopHtml);
  }
});

const changeDraftOrderStatus = (draftOrder, paymentNumber) => {
  $.ajax({
    type: 'GET',
    url: `http://localhost:9000/add-to-cart`,
    data: {
      paymentId: paymentNumber,
      draftOrderId: draftOrder,
    },
    success: function (data) {
      updateFrontendCart(data);
      showProductAdded();
    },
    error: function () {
      throw new Error('Some error Occoured');
    },
  });
};
