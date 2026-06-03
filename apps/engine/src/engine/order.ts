import type { CreateOrder, ToEngine } from "common";
import { db } from "../db/db";
import type { AskBid } from "../db/ask-bid";
import { Fill } from "../db/fill";
export type FillMapType = Map<string, { askBid: AskBid; fill: Fill }>;

export function createOrder(data: ToEngine<CreateOrder>) {
  const orderData = data.data;

  orderData.id = Number(orderData.id);
  orderData.marketId = Number(orderData.marketId);
  orderData.priceTick = BigInt(orderData.priceTick);
  orderData.quantityStep = BigInt(orderData.quantityStep);
  orderData.userId = Number(orderData.userId);

  if (orderData.orderSide == "BUY") {
    // Lock Required Collateral
    let requiredCollateral = orderData.priceTick * orderData.quantityStep;
    db.user.lockBalance(orderData.userId, requiredCollateral);

    let remainingQuantity = orderData.quantityStep;

    const asks: AskBid[] = db.orderbook.getAsks(
      orderData.quantityStep,
      orderData.priceTick,
      orderData.marketId,
    );

    // Generate Fills
    const fillMap = generateFills(orderData, asks);

    // Reduce locked collateral
    let takerCollateralSpent = 0n;

    fillMap.forEach((filledQuantity, id) => {
      takerCollateralSpent +=
        filledQuantity.fill.quantityStep * filledQuantity.fill.priceTick;

      // market maker crypto will be reduced,balance increased
      const makerEarning =
        filledQuantity.fill.quantityStep * filledQuantity.fill.priceTick;

      db.user.increaseBalance(filledQuantity.fill.makerUserId, makerEarning);
      db.user.decreaseAsset(
        filledQuantity.fill.makerUserId,
        orderData.marketId,
        filledQuantity.fill.quantityStep,
      );

      remainingQuantity -= filledQuantity.fill.quantityStep;
    });

    // Reduce taker locked collateral and increase amount of asset
    db.user.reduceCollateral(orderData.userId, takerCollateralSpent);
    db.user.increaseAsset(
      orderData.userId,
      orderData.marketId,
      orderData.quantityStep - remainingQuantity,
    );

    db.orderbook.deleteAsk(fillMap, orderData.marketId);

    if (orderData.orderType == "LIMIT") {
      // Add rest to orderbook
      db.orderbook.addNewOrder(
        orderData,
        remainingQuantity,
        requiredCollateral,
      );
    } // Market Order -> cancel the unfilled part
    else {
      // Send to redis, remaining event is cancelled
    }
  } // Sell Order
  else {
    let remainingQuantity = orderData.quantityStep;

    const bids: AskBid[] = db.orderbook.getBids(
      orderData.quantityStep,
      orderData.priceTick,
      orderData.marketId,
    );

    // Generate Fills
    const fillMap = generateFills(orderData, bids);

    /// Calculate asset quantity sold and amount earned
    let takerAmountEarned = 0n;
    let takerQuantitySold = 0n;
    fillMap.forEach((filledQuantity, id) => {
      takerAmountEarned +=
        filledQuantity.fill.quantityStep * filledQuantity.fill.priceTick;
      takerQuantitySold += filledQuantity.fill.quantityStep;

      // market maker crypto will be reduced,balance increased
      const makerCollateralUsed =
        filledQuantity.fill.quantityStep * filledQuantity.fill.priceTick;

      db.user.reduceCollateral(
        filledQuantity.fill.makerUserId,
        makerCollateralUsed,
      );
      db.user.increaseAsset(
        filledQuantity.fill.makerUserId,
        orderData.marketId,
        filledQuantity.fill.quantityStep,
      );
      remainingQuantity -= filledQuantity.fill.quantityStep;
    });

    // Reduce taker locked collateral and increase amount spent
    db.user.increaseBalance(orderData.userId, takerAmountEarned);
    db.user.decreaseAsset(
      orderData.userId,
      orderData.marketId,
      takerQuantitySold,
    );

    db.orderbook.deleteBids(fillMap, orderData.marketId);

    if (orderData.orderType == "LIMIT") {
      // Add rest to orderbook
      db.orderbook.addNewOrder(orderData, remainingQuantity, 0n);
    }
  }
}
function generateFills(orderData: CreateOrder, askBids: AskBid[]) {
  const fillMap: FillMapType = new Map(); // <Ask/Bid Id, quantity consumed>

  let remainingQuantityStep = orderData.quantityStep;

  for (const askBid of askBids) {
    if (remainingQuantityStep == 0n) break;
    let fillQuantityStep =
      remainingQuantityStep < askBid.quantityStep
        ? remainingQuantityStep
        : askBid.quantityStep;
    remainingQuantityStep -= fillQuantityStep;

    // Generating Fill
    const fillData = new Fill(
      orderData.id,
      orderData.userId,
      askBid.userId,
      askBid.orderId,
      fillQuantityStep,
      askBid.priceTick,
    );

    // Push to db
    db.fill.addFill(fillData);
    fillMap.set(askBid.id, { askBid: askBid, fill: fillData });
  }

  return fillMap;
}
