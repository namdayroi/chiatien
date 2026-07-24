import React, { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import { MemberBalance, Expense } from '../types';
import { formatVND } from '../utils/calculations';
import { CATEGORIES } from '../utils/constants';

interface MemberBalancesProps {
  balances: MemberBalance[];
  expenses: Expense[];
  onOpenAddExpense: () => void;
}

export const MemberBalances: React.FC<MemberBalancesProps> = ({
  balances,
  expenses,
  onOpenAddExpense,
}) => {
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const totalRoomSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const activeMembersCount = balances.length || 4;
  const avgPerPerson = Math.round(totalRoomSpent / activeMembersCount);

  const toggleExpand = (id: string) => {
    setExpandedMemberId(expandedMemberId === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Tổng chi tiêu phòng</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {formatVND(totalRoomSpent)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Gồm {expenses.length} khoản chi chung
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>Trung bình mỗi người</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-200 tracking-tight">
            {formatVND(avgPerPerson)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Chia cho {activeMembersCount} thành viên
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Trạng thái công nợ</span>
            <span className="text-emerald-400 font-semibold text-[11px]">4 Thành viên</span>
          </div>
          <div className="text-xs text-slate-300">
            Huy, Nam, Nghĩa, Tuyên chia tiền tự động
          </div>
          <button
            onClick={onOpenAddExpense}
            className="mt-2 w-full py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            + Thêm khoản chi mới
          </button>
        </div>
      </div>

      {/* 4 Roommates Balance Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>Bảng tổng kết 4 thành viên</span>
            <span className="text-[11px] font-normal text-slate-400 lowercase">
              (bấm vào để xem chi tiết)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {balances.map(({ member, totalPaid, totalOwed, netBalance }) => {
            const isExpanded = expandedMemberId === member.id;

            // Expenses paid by this member
            const paidExpenses = expenses.filter((e) => e.payerId === member.id);
            // Expenses shared by this member
            const sharedExpenses = expenses.filter((e) => e.participants?.includes(member.id));

            return (
              <div
                key={member.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Member Avatar & Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold border ${member.avatarBg} shadow-xs`}
                    >
                      {member.avatarText}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{member.name}</h3>
                      <p className="text-xs text-slate-400">
                        Đã chi {paidExpenses.length} khoản
                      </p>
                    </div>
                  </div>

                  {/* Net Balance Badge */}
                  <div className="text-right">
                    {netBalance > 0 ? (
                      <div className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                        <span>+{formatVND(netBalance)}</span>
                      </div>
                    ) : netBalance < 0 ? (
                      <div className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-800/80 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                        <span>-{formatVND(Math.abs(netBalance))}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã sòng phẳng</span>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1 font-medium">
                      {netBalance > 0
                        ? 'Được nhận lại'
                        : netBalance < 0
                        ? 'Cần trả thêm'
                        : '0 đ'}
                    </div>
                  </div>
                </div>

                {/* Stat Breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Đã ứng tiền:</span>
                    <span className="font-bold text-slate-200">{formatVND(totalPaid)}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Phải chịu tiền:</span>
                    <span className="font-bold text-slate-200">{formatVND(totalOwed)}</span>
                  </div>
                </div>

                {/* Collapsible details */}
                <button
                  onClick={() => toggleExpand(member.id)}
                  className="mt-3 w-full text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 pt-1"
                >
                  <span>
                    {isExpanded ? 'Ẩn chi tiết' : 'Xem các khoản đã trả / tham gia'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-300 text-[11px] mb-1.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {member.name} đã đứng ra chi trả ({paidExpenses.length}):
                      </h4>
                      {paidExpenses.length === 0 ? (
                        <p className="text-slate-500 italic text-[11px] pl-3">Chưa đứng ra chi khoản nào</p>
                      ) : (
                        <div className="space-y-1.5 pl-2">
                          {paidExpenses.map((exp) => {
                            const cat = CATEGORIES[exp.category] || CATEGORIES.other;
                            return (
                              <div
                                key={exp.id}
                                className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800/60"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <span className="text-[11px] font-medium text-slate-300 truncate">
                                    {exp.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ({cat.name})
                                  </span>
                                </div>
                                <span className="font-bold text-emerald-400 text-[11px] shrink-0">
                                  {formatVND(exp.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <h4 className="font-semibold text-slate-300 text-[11px] mb-1.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        {member.name} có tham gia sử dụng ({sharedExpenses.length}):
                      </h4>
                      {sharedExpenses.length === 0 ? (
                        <p className="text-slate-500 italic text-[11px] pl-3">Chưa tham gia khoản chi nào</p>
                      ) : (
                        <div className="space-y-1.5 pl-2 max-h-40 overflow-y-auto pr-1">
                          {sharedExpenses.map((exp) => {
                            const share = exp.customSplits?.[member.id] || (exp.amount / exp.participants.length);
                            return (
                              <div
                                key={exp.id}
                                className="flex items-center justify-between bg-slate-950/40 p-1.5 rounded-lg text-[11px]"
                              >
                                <span className="text-slate-400 truncate">{exp.title}</span>
                                <span className="text-slate-300 font-mono">
                                  {formatVND(share)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
