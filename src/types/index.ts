export interface Pub {
    id?: string;
    pub_name: string;
    address: string;
    note?: string;
    order_index?: number;
  }

  export interface Drink {
    id: string;
    name: string;
    type: 'beer' | 'cocktail' | 'wine' | 'shot' | 'soft';
    calories: number;
    alcoholContent: number;
    icon: string;
  }

  export interface DrinkEntry {
    id: string;
    drinkId: string;
    pubId: string;
    routeId: string;
    timestamp: string;
    quantity: number;
  }
  
  export interface Route {
    id: string;
    name: string;
    created_at: string;
    completed_at?: string;
    status: 'active' | 'completed';
    ownerId: string; // Guest user ID who created the route
    participants: string[]; // Array of guest user IDs
    pubs?: Pub[];
  }
  
export interface RouteWithPubCount extends Omit<Route, 'pubs'> {
  pub_count: number;
}

  export interface GuestUser {
    id: string;
    name: string;
    avatar: string;
    createdAt: string;
  }

  export interface PubRating {
    id: string;
    pubId: string;
    userId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
  }