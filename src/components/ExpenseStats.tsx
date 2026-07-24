import React from 'react';
import { PieChart, Zap, Droplet, Wifi, Home, Utensils, ShoppingBag, TrendingUp, Users, Calendar } from 'lucide-react';
import { Expense, Member, MemberBalance } from '../types';
import { formatVND, formatMonthName } from '../utils/calculations';
import { CATEGORIES } from '../utils/constants';

interface ExpenseStatsProps {
  expenses: Expense[];
  members: Member[];
  balances: MemberBalance[];
  selectedMonth?: string;
}

export const ExpenseStats: React.FC<ExpenseStatsProps> = ({ expenses, members, balances, selectedMonth }) => {
  const totalRoomSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  Object.keys(CATEGORIES).forEach((catKey) => {
    categoryTotals[catKey] = 0;
  });

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Calculate member contribution percentages
  const memberPaidTotals: Record<string, number> = {};
  balances.forEach((b) => {
    memberPaidTotals[b.member.id] = b.totalPaid;
  });

  return (
    <div className="space-y-5">
      {/* Total Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-1.5">
                Thống Kê Chi Tiêu {selectedMonth ? `(${formatMonthName(selectedMonth)})` : 'Phòng'}
              </h2>
              <p className="text-xs text-slate-400">Phân tích danh mục và phần đóng góp</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Tổng đã chi</div>
            <div className="text-lg font-extrabold text-emerald-400">{formatVND(totalRoomSpent)}</div>
          </div>
        </div>
      </div>

      {/* Category & Member Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Theo Danh Mục Chi Tiêu</span>
          </h3>

          {totalRoomSpent === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">Chưa có dữ liệu chi tiêu</p>
          ) : (
            <div className="space-y-3.5">
              {Object.values(CATEGORIES).map((cat) => {
                const amount = categoryTotals[cat.id] || 0;
                const percent = totalRoomSpent > 0 ? Math.round((amount / totalRoomSpent) * 100) : 0;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                      <span className="text-slate-400 font-mono">
                        {formatVND(amount)} ({percent}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cat.color.split(' ')[0]}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Member Contribution Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Tỷ Lệ Ứng Tiền Đã Trả (Huy, Nam, Nghĩa, Tuyên)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {balances.map(({ member, totalPaid }) => {
                const percent = totalRoomSpent > 0 ? Math.round((totalPaid / totalRoomSpent) * 100) : 0;

                return (
                  <div
                    key={member.id}
                    className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${member.avatarBg}`}
                      >
                        {member.avatarText}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{member.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{formatVND(totalPaid)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        {percent}%
                      </span>
                      <span className="block text-[10px] text-slate-500">tổng chi</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
