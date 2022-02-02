import _ from "lodash";

export async function getOrderId(instance, req) {
  let amount = req.query.amount;
  let draft = req.query.draftOrder;
  const orderId = instance.orders.create({
    amount: amount,
    currency: "INR",
    receipt: "receipt#1",
    notes: {
      draftOrderId: draft,
    },
  });
  return orderId;
}
