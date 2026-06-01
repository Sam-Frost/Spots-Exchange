import { OrderBook } from "./orderbook";
import { User } from "./user";

class Db {
  users: User[] = [];
  orderbooks: Map<number, OrderBook> = new Map();
  // fills: Fill[] = [];
}

const database = new Db();

export const db = {
  user: {
    getUser,
    createUser,
  },
  orderbook: {
    createNewOrderBook,
  },
  fill: {},
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

// Orderbook Functions
function createNewOrderBook(marketId: number) {
  const orderbookExists = database.orderbooks.get(marketId);

  if (orderbookExists) throw new Error("ORDERBOOK_ALREADY_EXISTS");

  database.orderbooks.set(marketId, new OrderBook());
}
