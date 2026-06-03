export class User {
  userId: number;
  balance: bigint;
  lockedBalance: bigint;
  assets: Map<number, bigint> = new Map();

  constructor(userId: number) {
    this.userId = userId;
    this.balance = 0n;
    this.lockedBalance = 0n;
  }
}
