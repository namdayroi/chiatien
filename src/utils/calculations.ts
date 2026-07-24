import { Expense, Member, MemberBalance, DebtTransaction } from '../types';

/**
 * Format month key YYYY-MM into friendly display (e.g. "Tháng 07/2026")
 */
export function formatMonthName(yearMonth: string): string {
  if (!yearMonth || yearMonth === 'all') return 'Tất cả các tháng';
  const parts = yearMonth.split('-');
  if (parts.length < 2) return yearMonth;
  const year = parts[0];
  const month = parts[1];
  return `Tháng ${month}/${year}`;
}

/**
 * Format currency to Vietnamese Dong string (e.g., 1.250.000 ₫)
 */
export function formatVND(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('vi-VN').format(rounded);
  return `${formatted} ₫`;
}

/**
 * Format short VND representation (e.g., 1.5tr, 250k)
 */
export function formatShortVND(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const millions = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${millions}tr đ`;
  }
  if (abs >= 1_000) {
    const thousands = Math.round(amount / 1_000);
    return `${thousands}k đ`;
  }
  return `${amount}đ`;
}

/**
 * Calculate balances for all members
 */
export function calculateBalances(members: Member[], expenses: Expense[]): MemberBalance[] {
  // Initialize balance dictionary
  const balancesMap: Record<string, { paid: number; owed: number }> = {};
  members.forEach((m) => {
    balancesMap[m.id] = { paid: 0, owed: 0 };
  });

  expenses.forEach((expense) => {
    // Add to payer's total paid
    if (balancesMap[expense.payerId]) {
      balancesMap[expense.payerId].paid += expense.amount;
    }

    if (!expense.participants || expense.participants.length === 0) return;

    // Custom split or equal split
    if (expense.customSplits && Object.keys(expense.customSplits).length > 0) {
      Object.entries(expense.customSplits).forEach(([mId, splitAmt]) => {
        if (balancesMap[mId]) {
          balancesMap[mId].owed += splitAmt;
        }
      });
    } else {
      const sharePerPerson = expense.amount / expense.participants.length;
      expense.participants.forEach((mId) => {
        if (balancesMap[mId]) {
          balancesMap[mId].owed += sharePerPerson;
        }
      });
    }
  });

  return members.map((member) => {
    const record = balancesMap[member.id] || { paid: 0, owed: 0 };
    const netBalance = Math.round(record.paid - record.owed);
    return {
      member,
      totalPaid: Math.round(record.paid),
      totalOwed: Math.round(record.owed),
      netBalance,
    };
  });
}

/**
 * Calculate simplified debt settlement transactions (Minimizes transactions count)
 */
export function calculateDebtSettlement(balances: MemberBalance[]): DebtTransaction[] {
  // Clone balances
  interface NetPerson {
    member: Member;
    net: number;
  }

  const debtors: NetPerson[] = []; // owes money (net < 0)
  const creditors: NetPerson[] = []; // receives money (net > 0)

  balances.forEach((b) => {
    // Allow small epsilon tolerance (e.g. 100 VND)
    if (b.netBalance < -10) {
      debtors.push({ member: b.member, net: Math.abs(b.netBalance) });
    } else if (b.netBalance > 10) {
      creditors.push({ member: b.member, net: b.netBalance });
    }
  });

  // Sort debtors by largest debt first, creditors by largest credit first
  debtors.sort((a, b) => b.net - a.net);
  creditors.sort((a, b) => b.net - a.net);

  const transactions: DebtTransaction[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.net, creditor.net);
    const roundedAmount = Math.round(amount);

    if (roundedAmount > 0) {
      transactions.push({
        from: debtor.member,
        to: creditor.member,
        amount: roundedAmount,
      });
    }

    debtor.net -= amount;
    creditor.net -= amount;

    if (debtor.net < 10) {
      dIdx++;
    }
    if (creditor.net < 10) {
      cIdx++;
    }
  }

  return transactions;
}

/**
 * Generate formatted text report for Zalo / Messenger
 */
export function generateZaloReport(
  expenses: Expense[],
  members: Member[],
  balances: MemberBalance[],
  settlements: DebtTransaction[]
): string {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  let text = `📌 BÁO CÁO CÔNG NỢ TIỀN PHÒNG (${dateStr})\n`;
  text += `------------------------------------\n`;
  text += `💰 Tổng chi tiêu: ${formatVND(totalSpent)}\n`;
  text += `📝 Tổng số khoản chi: ${expenses.length}\n\n`;

  text += `📊 CHI TIẾT TỪNG NGUỜI:\n`;
  balances.forEach((b) => {
    const status =
      b.netBalance > 0
        ? `🟢 Nhận lại: +${formatVND(b.netBalance)}`
        : b.netBalance < 0
        ? `🔴 Cần trả: -${formatVND(Math.abs(b.netBalance))}`
        : `⚪ Đã hòa vốn (0đ)`;
    text += `• ${b.member.name}: Đã trả ${formatVND(b.totalPaid)} | Phải chịu ${formatVND(b.totalOwed)} => ${status}\n`;
  });

  text += `\n🤝 GỢI Ý CHUYỂN KHOẢN THANH TOÁN:\n`;
  if (settlements.length === 0) {
    text += `✅ Tất cả đã sòng phẳng, không ai nợ ai!\n`;
  } else {
    settlements.forEach((s, idx) => {
      text += `${idx + 1}. ${s.from.name} ➡️ chuyển cho ${s.to.name}: ${formatVND(s.amount)}\n`;
    });
  }

  text += `\n--- Chi tiêu phòng Huy, Nam, Nghĩa, Tuyên ---`;
  return text;
}
