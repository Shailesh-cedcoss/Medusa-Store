import { Router } from "express";
import bodyParser from "body-parser";

export default () => {
  const app = Router();
  app.get("/welcome", bodyParser.json(), async (req, res) => {
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
  return app;
};
