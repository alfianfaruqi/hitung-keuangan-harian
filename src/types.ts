export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string; // YYYY-MM-DD format
  note?: string;
}

export interface AICoachResponse {
  score: number;
  summary: string;
  tips: string[];
  weeklyOutlook: string;
}

export interface ParsedAIItem {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export type CategoryType = 
  | "Makanan" 
  | "Transportasi" 
  | "Belanja" 
  | "Hiburan" 
  | "Tagihan" 
  | "Kesehatan" 
  | "Investasi" 
  | "Gaji" 
  | "Lainnya";
