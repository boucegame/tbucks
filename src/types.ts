export interface User {
  uid: string;
  username: string;
  tBucks: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  username: string;
  itemId: string;
  itemName: string;
  price: number;
  status: 'placed' | 'seen' | 'shipped';
  fulfillmentText?: string;
  createdAt: number;
}