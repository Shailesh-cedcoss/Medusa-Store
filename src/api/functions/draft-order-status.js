export default async function changeOrderStatus(req, res) {
  const DraftId = req.query.draftOrderId;
  const draftOrderService = req.scope.resolve('draftOrderService');
  const paymentProviderService = req.scope.resolve('paymentProviderService');
  const orderService = req.scope.resolve('orderService');
  const cartService = req.scope.resolve('cartService');
  const entityManager = req.scope.resolve('manager');

  let order;

  await entityManager.transaction(async (manager) => {
    const draftOrder = await draftOrderService
      .withTransaction(manager)
      .retrieve(DraftId);
    console.log(draftOrder);
    const cartId = draftOrder.cart_id;
    const cart = await cartService
      .withTransaction(manager)
      .retrieve(draftOrder.cart_id, {
        select: ['total'],
        relations: [
          'discounts',
          'discounts.rule',
          'discounts.rule.valid_for',
          'shipping_methods',
          'region',
          'items',
        ],
      });
    await paymentProviderService
      .withTransaction(manager)
      .createSession('system', cart);
    await cartService
      .withTransaction(manager)
      .setPaymentSession(cart.id, 'system');

    await cartService.withTransaction(manager).authorizePayment(cart.id);
    try {
      order = await orderService
        .withTransaction(manager)
        .createFromCart(cartId);
    } catch (error) {
      if (error && error.message === 'Order from cart already exists') {
        order = await orderService
          .withTransaction(manager)
          .retrieveByCartId(cartId, {
            select: [
              'subtotal',
              'tax_total',
              'shipping_total',
              'discount_total',
              'total',
            ],
            relations: ['shipping_address', 'items', 'payments'],
          });

        return {
          responseCode: 200,
          responseBody: { data: order, type: 'order' },
        };
      }
      if (error && error.code === 'insufficient_inventory') {
        return {
          responseCode: 409,
          responseBody: {
            message: error.message,
            type: error.type,
            code: error.code,
          },
        };
      }
      throw error;
    }
  });
  res.status(200).json({ order });
}
