$(document).ready(async function() {
  var navHeight = $('.mwb-product-nav').height();
  $('body').css('padding-top', navHeight);
//   alert(navHeight);
//   $(window).scroll(function() {    
//     var scroll = $(window).scrollTop();
//     if (scroll >= navHeight) {
//       $('body').addClass("mwb-fixHeader");
      
//     }
//     else {
//       $('body').removeClass("mwb-fixHeader");
//       $('body').css('padding-top', 0);
//     }
//   });
    
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
  function fetchCookie(name) {
    var nameEqs = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEqs) == 0) return c.substring(nameEqs.length,c.length);
    }
    return null;
  }
  function deleteCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  // Product Tracking
  $(".mwb-product-list__quote-btn").click(async function() {
      let cartCookie = fetchCookie("mwbCart")
      if(cartCookie === null) {
        cartCookie = {products: {}, totalItems: 0, total: 0}
        setCookie('mwbCart', JSON.stringify(cartCookie)); 
      } else {
        cartCookie = JSON.parse(cartCookie);
      }
      let { products } = cartCookie;
      const productID = $(this).parent().parent().data('id')
      const price = $(this).parent().parent().data('price').replace(/[^\d.-]/g, '');
      const name = $(this).parent().parent().data('name')
      const image = $(this).parent().parent().data('image')
      
      if(productID in products){
        products[productID][1]['value'] += 1;
      } else {
        products[productID] = [
          {
            "name": "hs_product_id",
            "value": productID
          },
          {
            "name": "quantity",
            "value": 1
          },
          {
            "name": "price",
            "value": price
          },
          {
            "name": "name",
            "value" : name
          }
        ];
      }

      cartCookie.totalItems += 1 
      cartCookie.products = products
      cartCookie.total += price * 1
      setCookie("mwbCart", JSON.stringify(cartCookie))
    })
});