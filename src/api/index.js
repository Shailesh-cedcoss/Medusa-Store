import { Router } from "express";
import bodyParser from "body-parser";
import { MedusaError } from "medusa-core-utils";
import { allowCors } from "./functions/allow-cors";
import { addToCart } from "./functions/add-to-cart";
import { getOrderId } from "./functions/create-order-payment";
import { changeOrderStatus } from "./functions/draft-order-status";
import Razorpay from "razorpay";

export default () => {
  const app = Router();
  app.get("/add-to-cart", bodyParser.json(), async (req, res) => {
    allowCors(res);
    res.json(await addToCart(req));
  });

  app.get("/welcome-list", bodyParser.json(), async (req, res) => {
    allowCors(res);
    const draftOrderService = req.scope.resolve("draftOrderService");
    const selector = {};
    const listConfig = {
      select: [
        "id",
        "status",
        "display_id",
        "cart_id",
        "order_id",
        "canceled_at",
        "created_at",
        "updated_at",
        "metadata",
        "no_notification_order",
      ],
      relations: ["order", "cart"],
      skip: 0,
      take: 20,
      order: { created_at: "DESC" },
    };
    const [draftOrders, count] = await draftOrderService.listAndCount(
      selector,
      listConfig
    );
    res.json({
      draft_orders: draftOrders,
      count,
      offset: 0,
      limit: 20,
    });
  });

  app.get("/create-payment-order", bodyParser.json(), async (req, res) => {
    allowCors(res);
    const instance = new Razorpay({
      key_id: "rzp_test_dIIyGFY7lcgcVs",
      key_secret: "5UBJil2uuLDFoLHkF9Th8GzH",
    });

    res.json(await getOrderId(instance, req));
  });

  app.get("/change-draft-order-status", bodyParser.json(), async (req, res) => {
    allowCors(res);
    res.json(await changeOrderStatus(req));
  });

  return app;
};
