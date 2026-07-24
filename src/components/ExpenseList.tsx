import React, { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, User, Receipt, Filter, Plus } from 'lucide-react';
import { Expense, Member, CategoryType } from '../types';
import { formatVND } from '../utils/calculations';
import { CATEGORIES } from '../utils/constants';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenAddExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');

  const memberMap = new Map<string, Member>(members.map((m) => [m.id, m]));

  const filteredExpenses = expenses.filter((exp) => {
    // Search query
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.note && exp.note.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;

    // Payer filter
    const matchesPayer = selectedPayer === 'all' || exp.payerId === selectedPayer;

    return matchesSearch && matchesCategory && matchesPayer;
  });

  // Sort expenses by date descending
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
  });

  const totalFilteredSpent = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Search & Filters Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên khoản chi, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Loại:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Tất cả ({expenses.length})
          </button>
          {Object.values(CATEGORIES).map((cat) => {
            const count = expenses.filter((e) => e.category === cat.id).length;
            if (count === 0 && selectedCategory !== cat.id) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg shrink-0 border transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Payer Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-800/60 pt-2">
          <span className="text-[11px] text-slate-400 shrink-0 mr-1">Người trả:</span>
          <button
            onClick={() => setSelectedPayer('all')}
            className={`px-2 py-0.5 rounded-md shrink-0 border text-[11px] ${
              selectedPayer === 'all'
                ? 'bg-slate-800 border-slate-600 text-slate-100 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Tất cả 4 người
          </button>
          {members.map((m) => {
            const isSelected = selectedPayer === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedPayer(m.id)}
                className={`px-2 py-0.5 rounded-md shrink-0 border text-[11px] flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${m.avatarBg.split(' ')[0]}`} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Hiển thị {sortedExpenses.length} khoản chi</span>
        {sortedExpenses.length > 0 && (
          <span className="font-semibold text-emerald-400">
            Tổng: {formatVND(totalFilteredSpent)}
          </span>
        )}
      </div>

      {/* Expenses List */}
      {sortedExpenses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Không tìm thấy khoản chi nào</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Chưa có khoản chi tiêu phù hợp với bộ lọc hoặc danh sách đang trống.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="py-2 px-4 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm khoản chi ngay</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedExpenses.map((exp) => {
            const payer = memberMap.get(exp.payerId);
            const categoryObj = CATEGORIES[exp.category] || CATEGORIES.other;
            const participantCount = exp.participants ? exp.participants.length : 4;
            const perPersonAmount = Math.round(exp.amount / participantCount);

            return (
              <div
                key={exp.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all shadow-sm space-y-3"
              >
                {/* Top Row: Category badge, Date & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${categoryObj.color}`}
                    >
                      {categoryObj.name}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {exp.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Sửa khoản chi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa khoản chi "${exp.title}" (${formatVND(exp.amount)})?`)) {
                          onDeleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Xóa khoản chi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle Row: Title & Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-white leading-snug">{exp.title}</h3>
                    {exp.note && (
                      <p className="text-xs text-slate-400 mt-0.5 italic">{exp.note}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-base text-emerald-400 tracking-tight">
                      {formatVND(exp.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ~{formatVND(perPersonAmount)} / người ({participantCount} người)
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Payer & Participants */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  {/* Payer */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Đã trả:</span>
                    {payer && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${payer.avatarBg}`}
                        >
                          {payer.avatarText}
                        </span>
                        <span>{payer.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Participants list */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500">Cùng chia:</span>
                    <div className="flex -space-x-1 overflow-hidden">
                      {exp.participants?.map((pId) => {
                        const memberObj = memberMap.get(pId);
                        if (!memberObj) return null;
                        return (
                          <div
                            key={pId}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border border-slate-900 ${memberObj.avatarBg}`}
                            title={memberObj.name}
                          >
                            {memberObj.avatarText}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
