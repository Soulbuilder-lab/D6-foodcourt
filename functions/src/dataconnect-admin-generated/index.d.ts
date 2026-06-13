import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CancelOrderData {
  order_delete?: Order_Key | null;
}

export interface CancelOrderVariables {
  id: UUIDString;
}

export interface CreateOrderData {
  order: Order_Key;
}

export interface CreateOrderVariables {
  vendorId: UUIDString;
  totalAmount: number;
}

export interface GetMyOrdersData {
  orders: ({
    id: UUIDString;
    totalAmount: number;
    status: string;
    pickupTime?: TimestampString | null;
    vendor: {
      name: string;
    };
  } & Order_Key)[];
}

export interface ListVendorsData {
  vendors: ({
    id: UUIDString;
    name: string;
    description: string;
    isOpen?: boolean | null;
  } & Vendor_Key)[];
}

export interface MenuItem_Key {
  id: UUIDString;
  __typename?: 'MenuItem_Key';
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Vendor_Key {
  id: UUIDString;
  __typename?: 'Vendor_Key';
}

/** Generated Node Admin SDK operation action function for the 'ListVendors' Query. Allow users to execute without passing in DataConnect. */
export function listVendors(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListVendorsData>>;
/** Generated Node Admin SDK operation action function for the 'ListVendors' Query. Allow users to pass in custom DataConnect instances. */
export function listVendors(options?: OperationOptions): Promise<ExecuteOperationResponse<ListVendorsData>>;

/** Generated Node Admin SDK operation action function for the 'GetMyOrders' Query. Allow users to execute without passing in DataConnect. */
export function getMyOrders(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyOrdersData>>;
/** Generated Node Admin SDK operation action function for the 'GetMyOrders' Query. Allow users to pass in custom DataConnect instances. */
export function getMyOrders(options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyOrdersData>>;

/** Generated Node Admin SDK operation action function for the 'CreateOrder' Mutation. Allow users to execute without passing in DataConnect. */
export function createOrder(dc: DataConnect, vars: CreateOrderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateOrderData>>;
/** Generated Node Admin SDK operation action function for the 'CreateOrder' Mutation. Allow users to pass in custom DataConnect instances. */
export function createOrder(vars: CreateOrderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateOrderData>>;

/** Generated Node Admin SDK operation action function for the 'CancelOrder' Mutation. Allow users to execute without passing in DataConnect. */
export function cancelOrder(dc: DataConnect, vars: CancelOrderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CancelOrderData>>;
/** Generated Node Admin SDK operation action function for the 'CancelOrder' Mutation. Allow users to pass in custom DataConnect instances. */
export function cancelOrder(vars: CancelOrderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CancelOrderData>>;

