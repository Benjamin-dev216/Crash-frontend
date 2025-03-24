export interface Bet {
  id: number;
  username: string;
  amount: number;
  cashoutAt: number | null;
}

export interface GameData {
  multiplier: number;
  crashPoint: number;
}

export interface UserData {
  username: string;
  amount: number;
}
