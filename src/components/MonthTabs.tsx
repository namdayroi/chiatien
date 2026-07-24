import React from 'react';
import { Calendar, Plus, FolderPlus, Table, Trash2, Check, LayoutGrid } from 'lucide-react';
import { Expense } from '../types';
import { formatMonthName, formatVND } from '../utils/calculations';

interface MonthTabsProps {
  months: string[]; // e.g. ['2026-07', '2026-08']
  selectedMonth: string; // 'all' or 'YYYY-MM'
  onSelectMonth: (monthKey: string) => void;
  onOpenAddMonthModal: () => void;
  onDeleteMonth?: (monthKey: string) => void;
  expenses: Expense[];
}

export const MonthTabs: React.FC<MonthTabsProps> = ({
  months,
  selectedMonth,
  onSelectMonth,
  onOpenAddMonthModal,
  onDeleteMonth,
  expenses,
}) => {
  // Compute counts & totals for each month key
  const monthStats: Record<string, { count: number; total: number }> = {};

  expenses.forEach((e) => {
    const monthKey = e.date.substring(0, 7);
    if (!monthStats[monthKey]) {
      monthStats[monthKey] = { count: 0, total: 0 };
    }
    monthStats[monthKey].count += 1;
    monthStats[monthKey].total += e.amount;
  });

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 py-2 px-3 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Mobile View: Clean Select Dropdown (Zero horizontal scrollbars) */}
        <div className="flex sm:hidden items-center justify-between gap-2 py-0.5">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Table className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="bg-slate-800 text-white font-bold text-xs rounded-xl px-3 py-2 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full truncate shadow-xs"
              id="mobile-month-select"
            >
              <option value="all">Tất cả các tháng ({expenses.length} khoản chi)</option>
              {months.map((mKey) => {
                const stats = monthStats[mKey] || { count: 0, total: 0 };
                return (
                  <option key={mKey} value={mKey}>
                    {formatMonthName(mKey)} ({stats.count} khoản • {formatVND(stats.total)})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={onOpenAddMonthModal}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 active:scale-95 transition-all"
            id="mobile-add-month-btn"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Thêm tháng</span>
          </button>
        </div>

        {/* Desktop View: Horizontal Tab Bar */}
        <div className="hidden sm:flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0 pr-1">
              <Table className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Bảng Tháng:</span>
            </div>

            {/* All Months Tab */}
            <button
              onClick={() => onSelectMonth('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedMonth === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tất cả các tháng</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  selectedMonth === 'all'
                    ? 'bg-slate-950/20 text-slate-950 font-bold'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {expenses.length}
              </span>
            </button>

            {/* Individual Month Tabs */}
            {months.map((mKey) => {
              const stats = monthStats[mKey] || { count: 0, total: 0 };
              const isActive = selectedMonth === mKey;

              return (
                <div key={mKey} className="relative group shrink-0">
                  <button
                    onClick={() => onSelectMonth(mKey)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-slate-950 font-bold shadow-md ring-2 ring-emerald-500/50'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{formatMonthName(mKey)}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {stats.count} khoản
                    </span>

                    {/* Optional Delete empty month button */}
                    {onDeleteMonth && stats.count === 0 && months.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Xóa bảng ${formatMonthName(mKey)} chưa có khoản chi nào?`)) {
                            onDeleteMonth(mKey);
                          }
                        }}
                        className="ml-1 p-0.5 hover:bg-rose-100 hover:text-rose-700 rounded text-slate-400"
                        title="Xóa bảng tháng trống này"
                      >
                        ✕
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            {/* Add New Month Sheet Button */}
            <button
              onClick={onOpenAddMonthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Thêm tháng mới</span>
            </button>
          </div>

          {/* Right Section: Active Month Summary Quick Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1 rounded-xl shrink-0">
            <span className="text-slate-400">Đang chọn:</span>
            <span className="font-bold text-emerald-400">{formatMonthName(selectedMonth)}</span>
            {selectedMonth !== 'all' && monthStats[selectedMonth] && (
              <span className="text-slate-400 font-mono">
                • Tổng chi: <strong className="text-white">{formatVND(monthStats[selectedMonth].total)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

};
