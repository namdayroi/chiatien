import { Expense, Member } from '../types';
import { CATEGORIES } from './constants';
import { formatVND } from './calculations';

/**
 * Exports the expenses list to an Excel-compatible CSV file with UTF-8 BOM (\uFEFF)
 * so Vietnamese characters display perfectly in Microsoft Excel and Google Sheets.
 */
export function exportExpensesToCSV(expenses: Expense[], members: Member[], filename = 'Chi_Tieu_Phong.csv') {
  const memberMap = new Map<string, Member>(members.map((m) => [m.id, m]));

  // CSV Headers matching the prompt specifications
  const headers = [
    'STT',
    'Ngày',
    'Nội dung khoản chi',
    'Loại chi phí',
    'Số tiền (VNĐ)',
    'Người đã trả',
    'Huy tham gia',
    'Nam tham gia',
    'Nghĩa tham gia',
    'Tuyên tham gia',
    'Số người cùng chia',
    'Số tiền mỗi người chịu (VNĐ)',
    'Ghi chú',
  ];

  const rows: string[][] = [headers];

  expenses.forEach((exp, index) => {
    const categoryName = CATEGORIES[exp.category]?.name || 'Khác';
    const payerName = memberMap.get(exp.payerId)?.name || exp.payerId;
    
    const participants = exp.participants || [];
    const count = participants.length;
    const sharePerPerson = count > 0 ? Math.round(exp.amount / count) : 0;

    const huyParticipates = participants.includes('huy') ? 'x' : '';
    const namParticipates = participants.includes('nam') ? 'x' : '';
    const nghiaParticipates = participants.includes('nghia') ? 'x' : '';
    const tuyenParticipates = participants.includes('tuyen') ? 'x' : '';

    const row = [
      (index + 1).toString(),
      exp.date,
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      `"${categoryName.replace(/"/g, '""')}"`,
      exp.amount.toString(),
      `"${payerName.replace(/"/g, '""')}"`,
      huyParticipates,
      namParticipates,
      nghiaParticipates,
      tuyenParticipates,
      count.toString(),
      sharePerPerson.toString(),
      `"${(exp.note || '').replace(/"/g, '""')}"`,
    ];

    rows.push(row);
  });

  // Calculate totals row
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  rows.push([
    'TỔNG CỘNG',
    '',
    '',
    '',
    totalAmount.toString(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  // Convert array of rows to CSV string
  const csvContent = rows.map((r) => r.join(',')).join('\n');

  // Add UTF-8 Byte Order Mark (BOM) \uFEFF to prevent encoding issues in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
