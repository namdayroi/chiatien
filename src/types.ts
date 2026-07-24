export type MemberId = string;

export interface Member {
  id: MemberId;
  name: string;
  avatarBg: string;
  avatarText: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type CategoryType = 'electricity' | 'water' | 'internet' | 'rent' | 'food' | 'other';

export interface Category {
  id: CategoryType;
  name: string;
  iconName: string;
  color: string;
}

export interface SplitShare {
  memberId: MemberId;
  amount: number; // calculated or custom amount
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: MemberId;
  participants: MemberId[]; // IDs of people who share this expense
  category: CategoryType;
  date: string; // ISO string YYYY-MM-DD
  note?: string;
  customSplits?: Record<MemberId, number>; // If uneven split
  createdAt: number;
}

export interface MemberBalance {
  member: Member;
  totalPaid: number;
  totalOwed: number; // total amount they are responsible for
  netBalance: number; // totalPaid - totalOwed. Positive = gets money back, Negative = owes money
}

export interface DebtTransaction {
  from: Member;
  to: Member;
  amount: number;
}

export type AuditAction = 'CREATE' | 'EDIT' | 'DELETE' | 'RESTORE';

export interface AuditLog {
  id: string;
  timestamp: number; // Date.now()
  action: AuditAction;
  expenseId: string;
  expenseTitle: string;
  amount: number;
  payerId: MemberId;
  details: string;
  previousExpense?: Expense;
  newExpense?: Expense;
}

export type ActiveTab = 'excel' | 'summary' | 'settlement' | 'stats' | 'history';

