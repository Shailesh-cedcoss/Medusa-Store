let ls = window.localStorage;
let medusaCart = ls.getItem('medusaCart');

const getCart = draftOrderId => {
  $.ajax({
    type: 'GET',
    url: `http://localhost:9000/add-to-cart?draftOrderId=${draftOrderId}`,
    success: function (data) {
      updateFrontendCart(data);
    },
    error: function () {
      throw new Error('Some error Occoured');
    },
  });
};

const updateFrontendCart = draftOrder => {
  ls.setItem('medusaCart', draftOrder.id);
  medusaCart = draftOrder.id;
  $('#cart-count').text(draftOrder.cart.items.length);
};

const showProductAdded = () => {
  $('#product-added-toast').css('display', 'block');
  setTimeout(function () {
    $('#product-added-toast').css('display', 'none');
  }, 1000);
};

$(document).ready(function () {
  if (medusaCart) {
    getCart(medusaCart);
  }

  $('.add-to-cart , .mwb-product-list__quote-btn').click(function () {
    let dataNode = $(this).closest('div[role="data-node"]');
    let varaintId = dataNode.data('id');
    $.ajax({
      type: 'GET',
      url: `http://localhost:9000/add-to-cart`,
      data: {
        variantId: varaintId,
        draftOrderId: medusaCart,
      },
      success: function (data) {
        updateFrontendCart(data);
        showProductAdded();
      },
      error: function () {
        throw new Error('Some error Occoured');
      },
    });
  });
});
