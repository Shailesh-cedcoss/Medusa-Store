$(document).ready(function () {
  let backToShopHtml = $($('.mwb-pro-details__row--shop')[0].outerHTML).css(
    'display',
    'block'
  );
  $('.mwb-pro-details__row--shop').remove();
  const ls = window.localStorage;
  let cart = ls.getItem('cart');
  if (cart === null) {
    const initialCart = { products: {}, totalItems: 0, totalPrice: 0 };
    ls.setItem('cart', JSON.stringify(initialCart));
  }
  cart = ls.getItem('cart');
  const cartData = JSON.parse(cart);
  const { products } = cartData;

  Object.keys(products).forEach(function (productID) {
    products[productID][2].value = Number(products[productID][2].value);
  });
  cartData.totalItems = parseInt(cartData.totalItems);
  cartData.totalPrice = parseFloat(cartData.totalPrice);

  $('#cart-count').text(cartData.totalItems);
  $('#cart-table-body').html('');
  let totalCartPrice = 0;
  let totalItems = 0;
  Object.keys(products).forEach(function (productID) {
    /**
     * 4 : Image
     * 1 : quantity
     * 2 : price
     * */
    let productTotalPrice = Number(
      (products[productID][2].value * products[productID][1].value).toFixed(2)
    );
    let productObj = $(
      `<tr role="product" data-id="${productID}">
              <td>
                <img src="${products[productID][4].value}">
                <span class="mwb-pro-details__name">
                  ${products[productID][3].value}
                </span>
              </td>
              <td>
                <button class="mwb-quantity-btn minus" role="dec-qty">-</button>
                <span role="quantity">${products[productID][1].value}</span>
                <button class="mwb-quantity-btn plus" role="inc-qty">+</button>
              </td>
              <td class="mwb-pro-details__table-price">
                ${productTotalPrice} $
              </td>
           </tr>
            `
    );
    ++totalItems;

    productObj.find('button[role="remove-from-cart"]').click(function () {
      let count = products[productID][1].value;
      let productPrice = products[productID][2].value * count;
      delete products[productID];
      getProductRow(this).remove();
      cartData.totalItems -= count;
      cartData.totalPrice -= productPrice;
      $('#cart-product-list')
        .find('span[role="cart-total-price"]')
        .text('Total Price :' + cartData.totalPrice.toFixed(2) + ' $');
      $('#cart-count').text(cartData.totalItems);
    });

    productObj.find('button[role="dec-qty"]').click(function () {
      products[productID][1].value = products[productID][1].value - 1;
      cartData.totalItems -= 1;
      cartData.totalPrice -= products[productID][2].value;
      if (products[productID][1].value === 0) {
        delete products[productID];
        getProductRow(this).remove();
        $('#cart-count').text(cartData.totalItems);
        $('#cart-total-price').text(
          'Total Price :' + cartData.totalPrice.toFixed(2) + ' $'
        );
        if (cartData.totalItems === 0) {
          $('#cart-container').html(backToShopHtml);
        }
      } else {
        updateProductInfoCart(
          getProductRow(this),
          products[productID][1].value,
          products[productID][2].value
        );
      }
    });

    productObj.find('button[role="inc-qty"]').click(function () {
      products[productID][1].value = products[productID][1].value + 1;
      cartData.totalPrice += products[productID][2].value;
      cartData.totalItems += 1;
      updateProductInfoCart(
        getProductRow(this),
        products[productID][1].value,
        products[productID][2].value
      );
    });
    $('#cart-table-body').append(productObj);
    if (totalItems === Object.keys(products).length) {
      $('#cart-table-body').append(
        '<tr><td colspan="3" id="cart-total-price">Total Price : ' +
          cartData.totalPrice.toFixed(2) +
          ' $</td></tr>'
      );
    }
  });
  if (cartData.totalItems === 0) {
    $('#cart-container').html(backToShopHtml);
  }

  window.addEventListener('unload', function () {
    ls.removeItem('cart');
    ls.setItem('cart', JSON.stringify(cartData));
  });

  window.addEventListener('message', event => {
    if (
      event.data.type === 'hsFormCallback' &&
      event.data.eventName === 'onFormSubmit'
    ) {
      cartData.formData = event.data.data;
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: '_hcms/api/makeDeal',
        data: JSON.stringify(cartData),
        success: function (data) {
          cartData.products = {};
          cartData.totalItems = 0;
          cartData.totalPrice = 0;
          window.location.href = '/thank-you';
        },
        error: function () {
          throw new Error('Some error occoured');
        },
      });
    }
  });
  updateProductInfoCart = function (productObj, quantity, price) {
    productObj.find('span[role="quantity"]').text(quantity);
    productObj
      .find('.mwb-pro-details__table-price')
      .text((quantity * price).toFixed(2) + ' $');
    $('#cart-total-price').text(
      'Total Price :' + cartData.totalPrice.toFixed(2) + ' $'
    );
    $('#cart-count').text(cartData.totalItems);
    if (cartData.totalItems === 0) {
      $('#cart-container').html(backToShopHtml);
    }
  };
});

function getProductRow(obj) {
  return $(obj).closest('tr[role="product"]');
}
