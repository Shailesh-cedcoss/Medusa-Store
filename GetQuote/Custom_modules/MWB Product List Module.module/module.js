$(document).ready(function () {
  const ls = window.localStorage;
  let cart = ls.getItem('cart');
  if (cart === null) {
    const initialCart = { products: {}, totalItems: 0, totalPrice : 0, version : 0.1 };
    ls.setItem('cart', JSON.stringify(initialCart));
  }
  
  cart = ls.getItem('cart');
  const cartData = JSON.parse(cart);
  const { products } = cartData;
  
  Object.keys(products).forEach(function (productID) {
    products[productID][2].value = Number(products[productID][2].value); 
  });
  cartData.totalItems = parseInt( cartData.totalItems);
  cartData.totalPrice = parseFloat(cartData.totalPrice);

  $('#cart-count').text(cartData.totalItems);
  
  $('.add-to-cart , .mwb-product-list__quote-btn').click(function () {   
    let dataNode = $(this).closest('div[role="data-node"]');
    const productID = dataNode.data('id');
    let price = parseFloat(dataNode
        .data('price')
        .replace(/[^\d.]/g, ''));
    let name = dataNode.data('name');
    let imageSrc = dataNode.data('image');
    addToCart(productID, 1, price, name, imageSrc);   
    let spanAdded = $('<span class="mwb-btn">Item Added</span>');
    spanAdded.click(function(){ window.location.href= "/checkout" });
    $(this).parent().html(spanAdded);        
    $('#product-added-toast').css('display','block');
    setTimeout(function(){ $('#product-added-toast').css('display','none'); }, 1000);      
  });

  $('.check-product').click(function () {
    const productID = $(this).data('id');
    $.ajax({
      type: 'GET',
      url: `_hcms/api/getProductDetails?productID=${productID}`,
      success : function(data) {
        $('#product-name').text(data.properties.name.value);
        $('#product-description').text(data.properties.description.value);
        $('#product-price').text(`${data.properties.price.value} $`);
        $('#create-date').text(data.properties.createdate.value);
        $('img[role="modal-product-image"]').attr(
          'src',
          data.properties.image.value
        );
        $('a[role="modal-quote-button"]').click(function(){
          let quantity = parseInt($('input[role="modal-product-quantity"]').val());
          addToCart(productID, quantity,data.properties.price.value, data.properties.name.value, data.properties.image.value );
          window.location.href="/checkout";
        });
        $('.mwb-modal').addClass('active');
        $('body').addClass('mwb-modal-open');
      },
      error : function(){
        throw new Error('Some error Occoured');
      }
    });
  });

  $('.mwb-modal-close').click(function () {
    $('.mwb-modal').removeClass('active');
    $('body').removeClass('mwb-modal-open');
  });
  
  window.addEventListener('unload',function(){
    ls.removeItem('cart');
    ls.setItem('cart', JSON.stringify(cartData));      
  });  
  
  getProductRow = function(obj){
    return $(obj).closest('.mwb-product-nav__pro-list-item');
  }
  
  addToCart = function(productID, quantity, price, name, imageSrc){
     if (productID in products) {
      products[productID][1].value = products[productID][1].value + Number(quantity);
      cartData.totalPrice += products[productID][2].value*quantity;
    } else {    
      products[productID] = [
        {
          name: 'hs_product_id',
          value: productID,
        },
        {
          name: 'quantity',
          value: quantity,
        },
        {
          name: 'price',
          value: price,
        },
        {
          name: 'name',
          value: name,
        },
        {
          name: 'image',
          value: imageSrc,
        },
      ];
      cartData.totalPrice += price;
    }
    cartData.totalItems += Number(quantity);
    $('#cart-count').text(cartData.totalItems);    
  }
});

  


