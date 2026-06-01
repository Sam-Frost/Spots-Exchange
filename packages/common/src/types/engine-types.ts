export type EventType =
  | "CREATE_MARKET"
  | "REGISTER_USER"
  | "ADD_BALANCE"
  | "CREATER_ORDER"
  | "CANCEL_ORDER";

export type ToEngine<T> = {
  correlationId: string;
  eventName: EventType;
  data: T;
};

export type ToBackend<T> = ToEngine<T> & {
  error: string;
  success: boolean;
};
