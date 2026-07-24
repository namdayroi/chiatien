import React from 'react';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, Users, Wallet, Receipt, Calculator, Calendar, PieChart } from 'lucide-react';
import { MemberBalance, Expense } from '../types';
import { formatVND, formatMonthName } from '../utils/calculations';
import { CATEGORIES } from '../utils/constants';

interface SummaryTableProps {
  balances: MemberBalance[];
  expenses: Expense[];
  selectedMonth?: string;
}

export const SummaryTable: React.FC<SummaryTableProps> = ({ balances, expenses, selectedMonth }) => {
  const totalPaidAll = balances.reduce((sum, b) => sum + b.totalPaid, 0);
  const totalOwedAll = balances.reduce((sum, b) => sum + b.totalOwed, 0);

  return (
    <div className="space-y-4">
      {/* Month Banner */}
      {selectedMonth && (
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-4 shadow-sm flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">
              Báo Cáo Tổng Kết: {formatMonthName(selectedMonth)}
            </span>
          </div>
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold px-2.5 py-1 rounded-xl">
            {expenses.length} khoản chi
          </span>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng tiền đã chi cả phòng</div>
            <div className="text-xl lg:text-2xl font-bold text-slate-900 font-mono mt-0.5">
              {formatVND(totalPaidAll)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Tất cả {expenses.length} hóa đơn đã ghi
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Trung bình mỗi người</div>
            <div className="text-xl lg:text-2xl font-bold text-slate-900 font-mono mt-0.5">
              {formatVND(Math.round(totalPaidAll / 4))}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Nhiệm vụ chia 4 thành viên
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium font-bold text-slate-700">Trạng thái công nợ</div>
            <div className="text-base font-bold text-emerald-600 mt-0.5">
              Huy • Nam • Nghĩa • Tuyên
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Tự động tính chênh lệch thu chi
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Responsive Member Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {balances.map(({ member, totalPaid, totalOwed, netBalance }) => {
          const isPositive = netBalance > 0;
          const isNegative = netBalance < 0;

          return (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${member.avatarBg}`}
                  >
                    {member.avatarText}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{member.name}</h4>
                    <span className="text-[11px] text-slate-400">Thành viên phòng</span>
                  </div>
                </div>
                {isPositive && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">
                    +Dư
                  </span>
                )}
                {isNegative && (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold">
                    -Thiếu
                  </span>
                )}
                {!isPositive && !isNegative && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold">
                    =Đủ
                  </span>
                )}
              </div>

              <div className="pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Đã trả:</span>
                  <span className="font-mono font-bold text-slate-800">{formatVND(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phải chịu:</span>
                  <span className="font-mono font-bold text-slate-700">{formatVND(totalOwed)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Chênh lệch:</span>
                  <span
                    className={`font-mono font-extrabold text-sm ${
                      isPositive
                        ? 'text-emerald-600'
                        : isNegative
                        ? 'text-rose-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {isPositive ? `+${formatVND(netBalance)}` : formatVND(netBalance)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Charts & Visual Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Chart 1: Total Expenses by Category */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Phân bổ chi tiêu theo danh mục</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Tỷ lệ %</span>
          </div>

          <div className="space-y-2 text-xs">
            {(() => {
              const categoryTotals: { [key: string]: number } = {};
              expenses.forEach((e) => {
                categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
              });

              const categoryKeys = Object.keys(CATEGORIES);
              return categoryKeys.map((catKey) => {
                const cat = CATEGORIES[catKey] || CATEGORIES.other;
                const totalAmt = categoryTotals[catKey] || 0;
                const percentage = totalPaidAll > 0 ? Math.round((totalAmt / totalPaidAll) * 100) : 0;

                return (
                  <div key={catKey} className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">{cat.name}</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {formatVND(totalAmt)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Chart 2: Paid Proportion by Person */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Số tiền từng người đã đứng ra ứng</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Huy • Nam • Nghĩa • Tuyên</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {balances.map(({ member, totalPaid }) => {
              const percentPaid = totalPaidAll > 0 ? Math.round((totalPaid / totalPaidAll) * 100) : 0;
              return (
                <div key={member.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${member.avatarBg}`}>
                        {member.avatarText}
                      </div>
                      <span className="font-bold text-slate-800">{member.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatVND(totalPaid)} ({percentPaid}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Spreadsheet Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span>BẢNG TỔNG KẾT NGHĨA VỤ CÔNG NỢ TỪNG NGUỜI</span>
          </h2>
          <span className="text-xs text-slate-300">Công thức: Chênh lệch = Đã trả - Phải chịu</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 divide-x divide-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-4 text-right">Tổng tiền đã thanh toán (1)</th>
                <th className="py-3 px-4 text-right">Tổng tiền thực tế phải chịu (2)</th>
                <th className="py-3 px-4 text-right">Chênh lệch (1 - 2)</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800">
              {balances.map(({ member, totalPaid, totalOwed, netBalance }, index) => {
                const isPositive = netBalance > 0;
                const isNegative = netBalance < 0;

                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors divide-x divide-slate-200">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{index + 1}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${member.avatarBg}`}
                        >
                          {member.avatarText}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{member.name}</div>
                          <div className="text-[10px] text-slate-500">Thành viên phòng</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono text-sm">
                      {formatVND(totalPaid)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-700 font-mono text-sm">
                      {formatVND(totalOwed)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold font-mono text-sm">
                      {isPositive && (
                        <span className="text-emerald-600">+{formatVND(netBalance)}</span>
                      )}
                      {isNegative && (
                        <span className="text-rose-600">-{formatVND(Math.abs(netBalance))}</span>
                      )}
                      {!isPositive && !isNegative && (
                        <span className="text-slate-500">0 ₫</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isPositive && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-xs">
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          Được nhận lại
                        </span>
                      )}
                      {isNegative && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-bold text-xs">
                          <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          Cần trả thêm
                        </span>
                      )}
                      {!isPositive && !isNegative && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã cân bằng
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 divide-x divide-slate-200">
                <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs">
                  CỘNG TỔNG CẢ PHÒNG:
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                  {formatVND(totalPaidAll)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                  {formatVND(totalOwedAll)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">
                  0 ₫
                </td>
                <td className="py-3 px-4 text-center text-xs text-slate-500 font-normal">
                  (Cân bằng tuyệt đối 100%)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
