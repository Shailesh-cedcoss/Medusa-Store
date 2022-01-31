import { Router } from "express";
import bodyParser from "body-parser";

export default () => {
  const app = Router();
  app.get("/welcome-create", bodyParser.json(), async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    const draftOrderService = req.scope.resolve("draftOrderService");
    const data = {
      email: "idk@email.com",
      customer_id: "cus_01FTQXNHFGAPJX2FYX91VM6PBH",
      region_id: "reg_01FTQVGGTD3109XBF8JQCHB1YH",
      shipping_methods: [
        {
          option_id: "so_01FTQVGGVC9E0PCX39P6GFER6M",
        },
      ],
      items: [
        {
          title: "XL / Black",
          variant_id: req.query.id,
          quantity: 10,
        },
      ],
    };
    let draftOrder = await draftOrderService.create(data);
    res.json({
      draft: draftOrder,
    });
  });
  app.get("/welcome-list", bodyParser.json(), async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
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
