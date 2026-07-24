import { Category, Member } from '../types';

export const DEFAULT_MEMBERS: Member[] = [
  { id: 'huy', name: 'Huy', avatarBg: 'bg-emerald-100 text-emerald-800 border-emerald-300', avatarText: 'H' },
  { id: 'nam', name: 'Nam', avatarBg: 'bg-blue-100 text-blue-800 border-blue-300', avatarText: 'N' },
  { id: 'nghia', name: 'Nghĩa', avatarBg: 'bg-amber-100 text-amber-800 border-amber-300', avatarText: 'N' },
  { id: 'tuyen', name: 'Tuyên', avatarBg: 'bg-purple-100 text-purple-800 border-purple-300', avatarText: 'T' },
];

export const CATEGORIES: Record<string, Category> = {
  electricity: { id: 'electricity', name: 'Tiền điện', iconName: 'Zap', color: 'bg-amber-500 text-amber-50 dark:bg-amber-600' },
  water: { id: 'water', name: 'Tiền nước', iconName: 'Droplet', color: 'bg-blue-500 text-blue-50 dark:bg-blue-600' },
  internet: { id: 'internet', name: 'Tiền mạng', iconName: 'Wifi', color: 'bg-indigo-500 text-indigo-50 dark:bg-indigo-600' },
  rent: { id: 'rent', name: 'Tiền nhà', iconName: 'Home', color: 'bg-emerald-500 text-emerald-50 dark:bg-emerald-600' },
  food: { id: 'food', name: 'Ăn uống / Chợ', iconName: 'Utensils', color: 'bg-rose-500 text-rose-50 dark:bg-rose-600' },
  other: { id: 'other', name: 'Đồ chung / Khác', iconName: 'ShoppingBag', color: 'bg-slate-500 text-slate-50 dark:bg-slate-600' },
};

export const SAMPLE_EXPENSES = [
  {
    id: 'sample-1',
    title: 'Tiền điện tháng 7',
    amount: 1200000,
    payerId: 'huy',
    participants: ['huy', 'nam', 'nghia', 'tuyen'],
    category: 'electricity' as const,
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    note: 'Đã đóng theo hóa đơn EVN',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'sample-2',
    title: 'Tiền nước & vệ sinh',
    amount: 320000,
    payerId: 'nam',
    participants: ['huy', 'nam', 'nghia', 'tuyen'],
    category: 'water' as const,
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    note: 'Tiền nước tháng 7',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'sample-3',
    title: 'Mạng Viettel 6 tháng',
    amount: 1350000,
    payerId: 'nghia',
    participants: ['huy', 'nam', 'nghia', 'tuyen'],
    category: 'internet' as const,
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    note: 'Đóng trước nửa năm cho rẻ',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'sample-4',
    title: 'Mua đồ ăn + gia vị chung',
    amount: 480000,
    payerId: 'tuyen',
    participants: ['huy', 'nam', 'nghia', 'tuyen'],
    category: 'food' as const,
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    note: 'Gồm mắm, muối, dầu ăn, gạo',
    createdAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'sample-5',
    title: 'Tiền nạp bình nước uống (4 bình)',
    amount: 80000,
    payerId: 'nam',
    participants: ['huy', 'nam', 'nghia'],
    category: 'other' as const,
    date: new Date().toISOString().split('T')[0],
    note: 'Tuyên về quê đợt này nên 3 người chia',
    createdAt: Date.now(),
  },
];
