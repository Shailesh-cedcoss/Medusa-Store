import { BaseService } from "medusa-interfaces";
import { MedusaError } from "medusa-core-utils";
import { Brackets } from "typeorm";

/**
 * Handles draft orders
 * @implements {BaseService}
 */
class DraftOrderService extends BaseService {
  static Events = {
    CREATED: "draft_order.created",
    UPDATED: "draft_order.updated",
  };

  constructor({
    manager,
    draftOrderRepository,
    paymentRepository,
    orderRepository,
    eventBusService,
    cartService,
    lineItemService,
    productVariantService,
    shippingOptionService,
  }) {
    super();
  }
  /**
   * Lists draft orders alongside the count
   * @param {object} selector - query selector to filter draft orders
   * @param {object} config - query config
   * @return {Promise<DraftOrder[]>} draft orders
   */
  async listAndCount(
    selector,
    config = { skip: 0, take: 50, order: { created_at: "DESC" } }
  ) {
    const draftOrderRepository = this.manager_.getCustomRepository(
      this.draftOrderRepository_
    );

    let q;
    if ("q" in selector) {
      q = selector.q;
      delete selector.q;
    }

    const query = this.buildQuery_(selector, config);

    if (q) {
      const where = query.where;

      delete where.display_id;

      query.join = {
        alias: "draft_order",
        innerJoin: {
          cart: "draft_order.cart",
        },
      };

      query.where = (qb) => {
        qb.where(where);

        qb.andWhere(
          new Brackets((qb) => {
            qb.where(`cart.email ILIKE :q`, {
              q: `%${q}%`,
            }).orWhere(`draft_order.display_id::varchar(255) ILIKE :dId`, {
              dId: `${q}`,
            });
          })
        );
      };
    }

    const [draftOrders, count] = await draftOrderRepository.findAndCount(query);

    return [draftOrders, count];
  }

  //   /**
  //    * Lists draft orders
  //    * @param {Object} selector - query object for find
  //    * @param {Object} config - configurable attributes for find
  //    * @return {Promise<DraftOrder>} list of draft orders
  //    */
  //   async list(
  //     selector,
  //     config = { skip: 0, take: 50, order: { created_at: "DESC" } }
  //   ) {
  //     const draftOrderRepo = this.manager_.getCustomRepository(
  //       this.draftOrderRepository_
  //     );

  //     const query = this.buildQuery_(selector, config);

  //     return draftOrderRepo.find(query);
  //   }

  //   /**
  //    * Creates a draft order.
  //    * @param {object} data - data to create draft order from
  //    * @return {Promise<DraftOrder>} the created draft order
  //    */
  //   async create(data) {
  //     return this.atomicPhase_(async (manager) => {
  //       const draftOrderRepo = manager.getCustomRepository(
  //         this.draftOrderRepository_
  //       );

  //       if (!data.region_id) {
  //         throw new MedusaError(
  //           MedusaError.Types.INVALID_DATA,
  //           `region_id is required to create a draft order`
  //         );
  //       }

  //       if (!data.items || !data.items.length) {
  //         throw new MedusaError(
  //           MedusaError.Types.INVALID_DATA,
  //           `Items are required to create a draft order`
  //         );
  //       }

  //       const {
  //         shipping_methods,
  //         discounts,
  //         no_notification_order,
  //         items,
  //         ...rest
  //       } = data;

  //       if (discounts) {
  //         for (const { code } of discounts) {
  //           rest.discounts = [];
  //           await this.cartService_
  //             .withTransaction(manager)
  //             .applyDiscount(rest, code);
  //         }
  //       }

  //       const createdCart = await this.cartService_
  //         .withTransaction(manager)
  //         .create({ type: "draft_order", ...rest });

  //       const draftOrder = draftOrderRepo.create({
  //         cart_id: createdCart.id,
  //         no_notification_order,
  //       });
  //       const result = await draftOrderRepo.save(draftOrder);

  //       await this.eventBus_
  //         .withTransaction(manager)
  //         .emit(DraftOrderService.Events.CREATED, {
  //           id: result.id,
  //         });

  //       for (const item of items) {
  //         if (item.variant_id) {
  //           const line = await this.lineItemService_
  //             .withTransaction(manager)
  //             .generate(item.variant_id, data.region_id, item.quantity, {
  //               metadata: item?.metadata || {},
  //               unit_price: item.unit_price,
  //             });

  //           await this.lineItemService_.withTransaction(manager).create({
  //             cart_id: createdCart.id,
  //             ...line,
  //           });
  //         } else {
  //           let price;
  //           if (typeof item.unit_price === `undefined` || item.unit_price < 0) {
  //             price = 0;
  //           } else {
  //             price = item.unit_price;
  //           }

  //           // custom line items can be added to a draft order
  //           await this.lineItemService_.withTransaction(manager).create({
  //             cart_id: createdCart.id,
  //             has_shipping: true,
  //             title: item.title || "Custom item",
  //             allow_discounts: false,
  //             unit_price: price,
  //             quantity: item.quantity,
  //           });
  //         }
  //       }

  //       for (const method of shipping_methods) {
  //         await this.cartService_
  //           .withTransaction(manager)
  //           .addShippingMethod(createdCart.id, method.option_id, method.data);
  //       }

  //       return result;
  //     });
  //   }

  //   /**
  //    * Registers a draft order as completed, when an order has been completed.
  //    * @param {string} doId - id of draft order to complete
  //    * @param {string} orderId - id of order completed from draft order cart
  //    * @return {Promise} the created order
  //    */
  //   async registerCartCompletion(doId, orderId) {
  //     return this.atomicPhase_(async (manager) => {
  //       const draftOrderRepo = manager.getCustomRepository(
  //         this.draftOrderRepository_
  //       );
  //       const draftOrder = await this.retrieve(doId);

  //       draftOrder.status = "completed";
  //       draftOrder.completed_at = new Date();
  //       draftOrder.order_id = orderId;

  //       await draftOrderRepo.save(draftOrder);
  //     });
  //   }

  //   /**
  //    * Updates a draft order with the given data
  //    * @param {String} doId - id of the draft order
  //    * @param {DraftOrder} data - values to update the order with
  //    * @return {Promise<DraftOrder>} the updated draft order
  //    */
  //   async update(doId, data) {
  //     return this.atomicPhase_(async (manager) => {
  //       const doRepo = manager.getCustomRepository(this.draftOrderRepository_);
  //       const draftOrder = await this.retrieve(doId);
  //       let touched = false;

  //       if (draftOrder.status === "completed") {
  //         throw new MedusaError(
  //           MedusaError.Types.NOT_ALLOWED,
  //           "Can't update a draft order which is complete"
  //         );
  //       }

  //       if (data.no_notification_order !== undefined) {
  //         touched = true;
  //         draftOrder.no_notification_order = data.no_notification_order;
  //       }

  //       if (touched) {
  //         doRepo.save(draftOrder);

  //         await this.eventBus_
  //           .withTransaction(manager)
  //           .emit(DraftOrderService.Events.UPDATED, {
  //             id: draftOrder.id,
  //           });
  //       }

  //       return draftOrder;
  //     });
  //   }
}

export default DraftOrderService;
