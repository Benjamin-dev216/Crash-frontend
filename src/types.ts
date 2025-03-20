export interface Bet {
  id: number;
  username: string;
  amount: number;
  cashoutAt: number | null;
}

export interface GameData {
  multiplier: number;
}

export interface UserData {
  userId: number;
  username: string;
  amount: number;
}
