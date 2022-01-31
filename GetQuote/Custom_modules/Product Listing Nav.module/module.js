$('.mwb-product-nav__toggle').click(function () {
  $(this).toggleClass('active');
  $(this).parents('.mwb-product-nav__row').toggleClass('menu-open');
  $(this)
    .parents('.mwb-product-nav__row')
    .children('.mwb-product-nav__menu-wrap')
    .toggle('slow');
});
