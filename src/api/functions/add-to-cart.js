import _ from "lodash";

const DEFAULT_REGION_ID = "reg_01FTT8FCX4G06C7YRTY8E95M3X";
const DEFAULT_SHIPPING_ID = "so_01FTT8FCY0YWVGD8XZMBPPPJFG";

const getDraftOrderData = (draftOrderService, draftOrderId) =>
  draftOrderService.retrieve(draftOrderId, {
    relations: ["order", "cart", "cart.items"],
  });

export async function addToCart(req) {
  const draftOrderService = req.scope.resolve("draftOrderService");
  let reqDraftOrderId = req.query.draftOrderId;
  let reqVariantId = req.query.variantId;
  let reqOperation = req.query.operation;

  if (reqDraftOrderId && !reqVariantId) {
    return await getDraftOrderData(draftOrderService, reqDraftOrderId);
  }
  if (reqDraftOrderId && reqVariantId && reqOperation) {
    let draftOrder = await getDraftOrderData(
      draftOrderService,
      reqDraftOrderId
    );

    let lineItem = _.find(draftOrder.cart.items, {
      variant_id: reqVariantId,
    });

    const lineItemService = req.scope.resolve("lineItemService");
    const cartService = req.scope.resolve("cartService");

    // if product does not exits in the draft order passed in the request
    if (!lineItem) {
      await createLinetItem(
        lineItemService,
        draftOrder,
        reqVariantId,
        cartService
      );
      return await getDraftOrderData(draftOrderService, reqDraftOrderId);
    }

    //
    const lineItemRet = await lineItemService.retrieve(lineItem.id);
    // if product exits then update the quantity
    await lineItemService.update(lineItemRet.id, {
      quantity:
        reqOperation == "dec" ? --lineItemRet.quantity : ++lineItemRet.quantity,
    });

    return await getDraftOrderData(draftOrderService, reqDraftOrderId);
  }

  if (reqDraftOrderId && reqVariantId) {
    let draftOrder = await getDraftOrderData(
      draftOrderService,
      reqDraftOrderId
    );

    let lineItem = _.find(draftOrder.cart.items, {
      variant_id: reqVariantId,
    });

    const lineItemService = req.scope.resolve("lineItemService");
    const cartService = req.scope.resolve("cartService");

    // if product does not exits in the draft order passed in the request
    if (!lineItem) {
      await createLinetItem(
        lineItemService,
        draftOrder,
        reqVariantId,
        cartService
      );
      return await getDraftOrderData(draftOrderService, reqDraftOrderId);
    }

    //
    const lineItemRet = await lineItemService.retrieve(lineItem.id);
    // if product exits then update the quantity
    await lineItemService.update(lineItemRet.id, {
      quantity: ++lineItemRet.quantity,
    });

    return await getDraftOrderData(draftOrderService, reqDraftOrderId);
  }

  if (reqVariantId) {
    // if there is no draft order and a product was passed
    let newDraftOrder = await draftOrderService.create({
      email: "cart@mwb.com",
      region_id: DEFAULT_REGION_ID,
      shipping_methods: [
        {
          option_id: DEFAULT_SHIPPING_ID,
        },
      ],
      items: [
        {
          variant_id: reqVariantId,
          quantity: 1,
        },
      ],
    });
    return await getDraftOrderData(draftOrderService, newDraftOrder.id);
  }
}

export const createLinetItem = async (
  lineItemService,
  draftOrder,
  variant_id,
  cartService
) => {
  const line = await lineItemService.generate(
    variant_id,
    draftOrder.cart.region_id,
    1
  );

  await cartService.addLineItem(draftOrder.cart_id, line);
};
