import _ from "lodash";

export async function changeOrderStatus(req) {
  // const { id } = req.query.draftOrderId;

  // const draftOrderService = req.scope.resolve("draftOrderService");
  // const paymentProviderService = req.scope.resolve("paymentProviderService");
  // const orderService = req.scope.resolve("orderService");
  // const cartService = req.scope.resolve("cartService");
  // const entityManager = req.scope.resolve("manager");

  // let result;
  // await entityManager.transaction(async (manager) => {
  //   const draftOrder = await draftOrderService
  //     .withTransaction(manager)
  //     .retrieve(id);

  //   const cart = await cartService
  //     .withTransaction(manager)
  //     .retrieve(draftOrder.cart_id, {
  //       select: ["total"],
  //       relations: [
  //         "discounts",
  //         "discounts.rule",
  //         "discounts.rule.valid_for",
  //         "shipping_methods",
  //         "region",
  //         "items",
  //       ],
  //     });

  //   await paymentProviderService
  //     .withTransaction(manager)
  //     .createSession("system", cart);

  //   await cartService
  //     .withTransaction(manager)
  //     .setPaymentSession(cart.id, "system");

  //   await cartService.withTransaction(manager).authorizePayment(cart.id);

  //   result = await orderService
  //     .withTransaction(manager)
  //     .createFromCart(cart.id);

  //   await draftOrderService
  //     .withTransaction(manager)
  //     .registerCartCompletion(draftOrder.id, result.id);
  // });

  // const order = await orderService.retrieve(result.id, {
  //   relations: defaultOrderRelations,
  //   select: defaultOrderFields,
  // });
  // res.status(200).json({ order });

  const draftOrderService = req.scope.resolve("draftOrderService");
  const cartService = req.scope.resolve("cartService");
  // const paymentProviderService = req.scope.resolve("paymentProviderService");
  const orderService = req.scope.resolve("orderService");
  const entityManager = req.scope.resolve("manager");
  let id = req.query.draftOrderId;
  // let paymentId = req.query.paymentId;

  let result;
  await entityManager.transaction(async (manager) => {
    const draftOrder = await draftOrderService
      .withTransaction(manager)
      .retrieve(id);

    const cart = await cartService
      .withTransaction(manager)
      .retrieve(draftOrder.cart_id, {
        select: ["total"],
        relations: [
          "discounts",
          "discounts.rule",
          "discounts.rule.valid_for",
          "shipping_methods",
          "region",
          "items",
        ],
      });

    // await paymentProviderService
    //   .withTransaction(manager)
    //   .createSession("system", cart);

    // await cartService
    //   .withTransaction(manager)
    //   .setPaymentSession(cart.id, "system");

    // await cartService.withTransaction(manager).authorizePayment(cart.id);

    result = await orderService
      .withTransaction(manager)
      .createFromCart(cart.id);

    await draftOrderService
      .withTransaction(manager)
      .registerCartCompletion(draftOrder.id, result.id);
  });
  const defaultOrderFields = [
    "id",
    "status",
    "fulfillment_status",
    "payment_status",
    "display_id",
    "cart_id",
    "draft_order_id",
    "customer_id",
    "email",
    "region_id",
    "currency_code",
    "tax_rate",
    "canceled_at",
    "created_at",
    "updated_at",
    "metadata",
    "items.refundable",
    "swaps.additional_items.refundable",
    "claims.additional_items.refundable",
    "shipping_total",
    "discount_total",
    "tax_total",
    "refunded_total",
    "gift_card_total",
    "subtotal",
    "total",
    "paid_total",
    "refundable_amount",
    "no_notification",
  ];
  const defaultOrderRelations = [
    "customer",
    "billing_address",
    "shipping_address",
    "discounts",
    "discounts.rule",
    "discounts.rule.valid_for",
    "shipping_methods",
    "payments",
    "fulfillments",
    "fulfillments.tracking_links",
    "fulfillments.items",
    "returns",
    "returns.items",
    "returns.items.reason",
    "gift_cards",
    "gift_card_transactions",
    "claims",
    "claims.return_order",
    "claims.return_order.shipping_method",
    "claims.shipping_methods",
    "claims.shipping_address",
    "claims.additional_items",
    "claims.fulfillments",
    "claims.claim_items",
    "claims.claim_items.item",
    "claims.claim_items.images",
    // "claims.claim_items.tags",
    "swaps",
    "swaps.return_order",
    "swaps.payment",
    "swaps.shipping_methods",
    "swaps.shipping_address",
    "swaps.additional_items",
    "swaps.fulfillments",
  ];
  const order = await orderService.retrieve(result.id, {
    relations: defaultOrderRelations,
    select: defaultOrderFields,
  });

  res.status(200).json({ order });
  if (draftOrder.status === "completed") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You are only allowed to update open draft orders"
    );
  }

  if (draftOrder.no_notification_order !== undefined) {
    await draftOrderService.update(draftOrder.id, {
      no_notification_order: draftOrder.no_notification_order,
    });
    delete draftOrder.no_notification_order;
  }

  await cartService.update(draftOrder.cart_id, draftOrder.cart);
  draftOrder.cart = await cartService.retrieve(draftOrder.cart_id, {
    select: [
      "subtotal",
      "tax_total",
      "shipping_total",
      "discount_total",
      "total",
    ],
    relations: [
      "items",
      "shipping_methods",
      "shipping_address",
      "billing_address",
      "gift_cards",
      "customer",
      "region",
      "payment_sessions",
      "region.countries",
      "discounts",
      "discounts.rule",
      "discounts.rule.valid_for",
      "discounts.regions",
    ],
  });
  res.status(200).json({ draft_order: draftOrder });
}
