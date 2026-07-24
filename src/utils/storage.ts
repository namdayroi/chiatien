import { Expense, Member, AuditLog, AuditAction } from '../types';
import { DEFAULT_MEMBERS, SAMPLE_EXPENSES } from './constants';

const STORAGE_KEY_EXPENSES = 'chia_tien_phong_expenses_v1';
const STORAGE_KEY_MEMBERS = 'chia_tien_phong_members_v1';
const STORAGE_KEY_MONTHS = 'chia_tien_phong_months_v1';
const STORAGE_KEY_AUDIT_LOGS = 'chia_tien_phong_audit_logs_v1';

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading audit logs from localStorage', e);
  }
  return [];
}

export function saveAuditLogs(logs: AuditLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving audit logs to localStorage', e);
  }
}

export function createAuditEntry(
  action: AuditAction,
  expense: Expense,
  previousExpense?: Expense,
  customDetails?: string
): AuditLog {
  const currentLogs = getStoredAuditLogs();
  let details = customDetails || '';

  if (!details) {
    if (action === 'DELETE') {
      details = `Đã xóa khoản chi "${expense.title}" (${expense.amount.toLocaleString('vi-VN')} ₫)`;
    } else if (action === 'CREATE') {
      details = `Tạo mới khoản chi "${expense.title}" (${expense.amount.toLocaleString('vi-VN')} ₫)`;
    } else if (action === 'EDIT') {
      const changes: string[] = [];
      if (previousExpense) {
        if (previousExpense.title !== expense.title) {
          changes.push(`Tên: "${previousExpense.title}" ➔ "${expense.title}"`);
        }
        if (previousExpense.amount !== expense.amount) {
          changes.push(
            `Số tiền: ${previousExpense.amount.toLocaleString('vi-VN')} ₫ ➔ ${expense.amount.toLocaleString('vi-VN')} ₫`
          );
        }
        if (previousExpense.date !== expense.date) {
          changes.push(`Ngày: ${previousExpense.date} ➔ ${expense.date}`);
        }
        if (previousExpense.payerId !== expense.payerId) {
          changes.push(`Người trả: ${previousExpense.payerId} ➔ ${expense.payerId}`);
        }
      }
      details = `Sửa khoản chi "${expense.title}"${
        changes.length > 0 ? ` (${changes.join(', ')})` : ''
      }`;
    } else if (action === 'RESTORE') {
      details = `Khôi phục khoản chi đã xóa "${expense.title}" (${expense.amount.toLocaleString('vi-VN')} ₫)`;
    }
  }

  const newLog: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp: Date.now(),
    action,
    expenseId: expense.id,
    expenseTitle: expense.title,
    amount: expense.amount,
    payerId: expense.payerId,
    details,
    ...(previousExpense ? { previousExpense } : {}),
    ...(expense ? { newExpense: expense } : {}),
  };

  const updatedLogs = [newLog, ...currentLogs];
  saveAuditLogs(updatedLogs);
  return newLog;
}


export function getStoredMembers(): Member[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading members from localStorage', e);
  }
  return DEFAULT_MEMBERS;
}

export function saveMembers(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Error saving members to localStorage', e);
  }
}

export function getStoredExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading expenses from localStorage', e);
  }
  // Initialize with sample expenses if first time
  saveExpenses(SAMPLE_EXPENSES);
  return SAMPLE_EXPENSES;
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage', e);
  }
}

export function getStoredMonths(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MONTHS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading custom months from localStorage', e);
  }
  return ['2026-07']; // Default month
}

export function saveMonths(months: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MONTHS, JSON.stringify(months));
  } catch (e) {
    console.error('Error saving custom months to localStorage', e);
  }
}

export function resetToSampleData(): { members: Member[]; expenses: Expense[]; months: string[] } {
  saveMembers(DEFAULT_MEMBERS);
  saveExpenses(SAMPLE_EXPENSES);
  const defaultMonths = ['2026-07'];
  saveMonths(defaultMonths);
  return {
    members: DEFAULT_MEMBERS,
    expenses: SAMPLE_EXPENSES,
    months: defaultMonths,
  };
}

export function clearAllData(): { members: Member[]; expenses: Expense[]; months: string[] } {
  saveMembers(DEFAULT_MEMBERS);
  saveExpenses([]);
  const defaultMonths = ['2026-07'];
  saveMonths(defaultMonths);
  return {
    members: DEFAULT_MEMBERS,
    expenses: [],
    months: defaultMonths,
  };
}

