import type { CreateOrder } from "common";
import { AskBid } from "./ask-bid";
import type { Fill } from "./fill";
import { OrderBook } from "./orderbook";
import { User } from "./user";
import type { FillMapType } from "../engine/order";

class Db {
  users: User[] = [];
  orderbooks: Map<number, OrderBook> = new Map();
  fills: Fill[] = [];
}

export const database = new Db();

export const db = {
  user: {
    getUser,
    createUser,
    increaseBalance,
    lockBalance,
    reduceCollateral,
    increaseAsset,
    decreaseAsset,
  },
  orderbook: {
    createNewOrderBook,
    getAsks,
    getBids,
    addNewOrder,
    deleteAsk,
    deleteBids,
  },
  fill: {
    addFill,
  },
};

// User Functions
function getUser(userId: number) {
  for (const user of database.users) {
    if (user.userId == userId) {
      return user;
    }
  }
  throw new Error(`USER_NOT_FOUND`);
}

function createUser(userId: number) {
  for (const user of database.users) {
    if (user.userId == userId) {
      throw new Error("USER_ALREADY_EXIST");
    }
  }
  database.users.push(new User(userId));
}

function increaseBalance(userId: number, amount: bigint) {
  console.log(`userId ${userId}`);
  const user = getUser(userId);

  user.balance += BigInt(amount);
  return user.balance;
}

function decreaseBalance(userId: number, amount: bigint) {
  const user = getUser(userId);

  if (user.balance - amount >= 0n) {
    user.balance -= amount;
    return user.balance;
  }

  throw new Error("User balance cannot be -ve");
}

function lockBalance(userId: number, amount: bigint) {
  const user = getUser(userId);
  amount = BigInt(amount);
  console.log(typeof amount);
  console.log(typeof user.lockedBalance);
  console.log(typeof user.balance);
  if (user.balance - amount >= 0n) {
    user.balance -= amount;
    user.lockedBalance += amount;
  }

  throw new Error("User doesn't have enough balance for order");
}

function reduceCollateral(userId: number, amount: bigint) {
  const user = getUser(userId);

  if (user.lockedBalance - amount >= 0n) {
    user.lockedBalance -= amount;
  }

  throw new Error("User doesn't have enough balance for reducing");
}

function increaseAsset(userId: number, marketId: number, amount: bigint) {
  const user = getUser(userId);

  let existingAsset = user.assets.getOrInsert(marketId, 0n);

  user.assets.set(marketId, (existingAsset += amount));

  return (existingAsset += amount);
}

function decreaseAsset(userId: number, marketId: number, amount: bigint) {
  const user = getUser(userId);

  let existingAsset = user.assets.getOrInsert(marketId, 0n);

  if (existingAsset - amount < 0) {
    throw new Error("User don't have this much asset!");
  }

  user.assets.set(marketId, (existingAsset -= amount));

  return (existingAsset -= amount);
}

// Orderbook Functions
function createNewOrderBook(marketId: number) {
  const orderbookExists = database.orderbooks.get(marketId);

  if (orderbookExists) throw new Error("ORDERBOOK_ALREADY_EXISTS");

  database.orderbooks.set(marketId, new OrderBook());
}

function getOrderBook(marketId: number) {
  const orderbook = database.orderbooks.get(marketId);

  if (!orderbook) throw new Error("Orderbook not present");

  return orderbook;
}

function getAsks(quantityStep: bigint, priceTick: bigint, marketId: number) {
  const orderbook = getOrderBook(marketId);
  let remainingQuantityStep = quantityStep;
  const response: AskBid[] = [];

  // Traverse all ask price ticks
  outer: for (const askPriceTick of orderbook.askPriceTicks) {
    // Get all asks for particular asks price
    const allAskTicks = orderbook.asks.get(askPriceTick);

    // If no bids skip
    if (!allAskTicks || allAskTicks.length == 0) {
      continue;
    }

    // If price of asks is more than order price, don't match
    if (askPriceTick > priceTick) break;

    for (const askTick of allAskTicks) {
      if (remainingQuantityStep > 0n) {
        remainingQuantityStep -=
          remainingQuantityStep < askTick.quantityStep
            ? remainingQuantityStep
            : askTick.quantityStep;
        response.push(askTick);
      } else {
        break outer;
      }
    }
  }

  return response;
}

function getBids(quantityStep: bigint, priceTick: bigint, marketId: number) {
  const orderbook = getOrderBook(marketId);
  let remainingQuantityStep = quantityStep;
  const response: AskBid[] = [];

  // Traverse all bid price ticks
  outer: for (const bidPriceTick of orderbook.bidPriceTicks) {
    // Get all bids for particular bids price
    const allBidTicks = orderbook.bids.get(bidPriceTick);

    // If no bids skip
    if (!allBidTicks || allBidTicks.length == 0) {
      continue;
    }

    // If price of bid is less than order price, don't match
    if (bidPriceTick < priceTick) break;

    for (const bidTick of allBidTicks) {
      if (remainingQuantityStep > 0n) {
        remainingQuantityStep -=
          remainingQuantityStep < bidTick.quantityStep
            ? remainingQuantityStep
            : bidTick.quantityStep;
        response.push(bidTick);
      } else {
        break outer;
      }
    }
  }

  return response;
}

function addNewOrder(
  orderData: CreateOrder,
  remainingQuantity: bigint,
  requiredCollateral: bigint,
) {
  const orderbook = getOrderBook(orderData.marketId);

  if (orderData.orderSide == "SELL") {
    const askPriceTicks = orderbook.askPriceTicks;

    // Get the aks arrays for this price
    const asks = orderbook.asks.get(orderData.priceTick);

    if (!asks) {
      const newAsksArray: AskBid[] = [];
      newAsksArray.push(
        new AskBid(
          orderData.userId,
          orderData.id,
          remainingQuantity,
          orderData.priceTick,
          requiredCollateral,
        ),
      );
      orderbook.asks.set(orderData.priceTick, newAsksArray);
    } else {
      asks.push(
        new AskBid(
          orderData.userId,
          orderData.id,
          remainingQuantity,
          orderData.priceTick,
          requiredCollateral,
        ),
      );
    }

    // Add price to asks in ascending order
    if (askPriceTicks.length == 0) {
      askPriceTicks.push(orderData.priceTick);
    } else {
      let isSmallest = true;

      for (let i = 0; i < askPriceTicks.length; i++) {
        // Price already exist
        if (askPriceTicks[i] == orderData.priceTick) {
          isSmallest = false;
          break;
        }

        if (orderData.priceTick < askPriceTicks[i]!) {
          askPriceTicks.splice(i, 0, orderData.priceTick);
          isSmallest = false;
          break;
        }
      }

      if (isSmallest)
        askPriceTicks.splice(askPriceTicks.length, 0, orderData.priceTick);
    }
  } // Sell
  else {
    const bidPriceTicks = orderbook.bidPriceTicks;

    // Get the aks arrays for this price
    const bids = orderbook.bids.get(orderData.priceTick);

    if (!bids) {
      const newBidsArray: AskBid[] = [];
      newBidsArray.push(
        new AskBid(
          orderData.userId,
          orderData.id,
          remainingQuantity,
          orderData.priceTick,
          requiredCollateral,
        ),
      );
      orderbook.bids.set(orderData.priceTick, newBidsArray);
    } else {
      bids.push(
        new AskBid(
          orderData.userId,
          orderData.id,
          remainingQuantity,
          orderData.priceTick,
          requiredCollateral,
        ),
      );
    }

    // Add price to bids in descending order
    if (bidPriceTicks.length == 0) {
      bidPriceTicks.push(orderData.priceTick);
    } else {
      let isSmallest = true;

      for (let i = 0; i < bidPriceTicks.length; i++) {
        // Price already exist
        if (bidPriceTicks[i] == orderData.priceTick) {
          isSmallest = false;
          break;
        }

        if (orderData.priceTick > bidPriceTicks[i]!) {
          bidPriceTicks.splice(i, 0, orderData.priceTick);
          isSmallest = false;
          break;
        }
      }

      if (isSmallest)
        bidPriceTicks.splice(bidPriceTicks.length, 0, orderData.priceTick);
    }
  }
}

function deleteAsk(fillMap: FillMapType, marketId: number) {
  const orderBook = getOrderBook(marketId);

  // Iterate over all the askPriceTicks
  for (const askPriceTick of orderBook.askPriceTicks) {
    // Get all asks at the askPriceTick
    const asks = orderBook.asks.get(askPriceTick);

    if (!asks) continue;
    // Iterate over all asks
    for (let i = asks.length - 1; i >= 0; i--) {
      // Current Ask
      const currAsk = asks[i]!;

      // Found matching ask
      const askQuantityStep = fillMap.get(currAsk.id)!;
      // Matchig ask not found, skipping
      if (!askQuantityStep) continue;

      // Complete ask got filled
      if (currAsk.quantityStep == askQuantityStep.fill.quantityStep) {
        asks.splice(i, 1);
      }
      // Ask partially filled
      else {
        currAsk.quantityStep -= askQuantityStep.fill.quantityStep;
      }
    }
  }
}

function deleteBids(fillMap: FillMapType, marketId: number) {
  const orderBook = getOrderBook(marketId);

  // Iterate over all the bidPriceTicks
  for (const bidPriceTick of orderBook.bidPriceTicks) {
    // Get all bids at the askPriceTick
    const bids = orderBook.bids.get(bidPriceTick);

    if (!bids) continue;
    // Iterate over all bids
    for (let i = bids.length - 1; i >= 0; i--) {
      // Current Bid
      const currBid = bids[i]!;

      // Found matching bid
      const bidQuantityStep = fillMap.get(currBid.id)!;
      // Matchig ask not found, skipping
      if (!bidQuantityStep) continue;

      // Complete bud got filled
      if (currBid.quantityStep == bidQuantityStep.fill.quantityStep) {
        bids.splice(i, 1);
      }
      // Bid partially filled
      else {
        currBid.quantityStep -= bidQuantityStep.fill.quantityStep;
      }
    }
  }
}

// Fills Functions
function addFill(fill: Fill) {
  database.fills.push(fill);
}

export function generateRandomId() {
  return crypto.randomUUID().toString();
}
