export class User {
  userId: number;
  balance: string;
  lockedBalance: string;

  constructor(userId: number) {
    this.userId = userId;
    this.balance = "0";
    this.lockedBalance = "0";
  }
}
