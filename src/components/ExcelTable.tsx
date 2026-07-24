import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Calendar,
  FileSpreadsheet,
  Download,
  RotateCcw,
  AlertCircle,
  Users
} from 'lucide-react';
import { Expense, Member, CategoryType, MemberId } from '../types';
import { formatVND, formatMonthName } from '../utils/calculations';
import { CATEGORIES } from '../utils/constants';
import { exportExpensesToCSV } from '../utils/excelExport';

interface ExcelTableProps {
  expenses: Expense[];
  members: Member[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenModalEdit?: (expense: Expense) => void;
  selectedMonth?: string;
  onSelectMonth?: (month: string) => void;
  allMonths?: string[];
  onOpenAddMonthModal?: () => void;
}

export const ExcelTable: React.FC<ExcelTableProps> = ({
  expenses,
  members,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onOpenModalEdit,
  selectedMonth: propSelectedMonth,
  onSelectMonth,
  allMonths = [],
  onOpenAddMonthModal,
}) => {
  // Filters state
  const [internalSelectedMonth, setInternalSelectedMonth] = useState<string>('all');
  const selectedMonth = propSelectedMonth !== undefined ? propSelectedMonth : internalSelectedMonth;

  const handleMonthChange = (month: string) => {
    if (onSelectMonth) {
      onSelectMonth(month);
    } else {
      setInternalSelectedMonth(month);
    }
  };

  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD or empty
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  // Table feedback error message
  const [tableError, setTableError] = useState<string | null>(null);

  // Mobile display view mode
  const [mobileView, setMobileView] = useState<'cards' | 'table'>('cards');
  const [selectedDetailExpense, setSelectedDetailExpense] = useState<Expense | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Editing inline or Modal
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Expense>>({});

  // Quick Inline New Row state
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('electricity');
  const [newPayerId, setNewPayerId] = useState<MemberId>('huy');
  const [newParticipants, setNewParticipants] = useState<MemberId[]>(['huy', 'nam', 'nghia', 'tuyen']);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState('');
  const [showQuickRow, setShowQuickRow] = useState(true);

  // Update newDate when selectedMonth changes
  useEffect(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    if (selectedMonth && selectedMonth !== 'all') {
      if (todayISO.startsWith(selectedMonth)) {
        setNewDate(todayISO);
      } else {
        setNewDate(`${selectedMonth}-01`);
      }
    } else {
      setNewDate(todayISO);
    }
  }, [selectedMonth]);

  // Available unique YYYY-MM months for filter
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    expenses.forEach((e) => {
      if (e.date) {
        monthsSet.add(e.date.substring(0, 7)); // 'YYYY-MM'
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Month filter
      if (selectedMonth !== 'all' && !exp.date.startsWith(selectedMonth)) {
        return false;
      }
      // Specific Date filter
      if (selectedDate && exp.date !== selectedDate) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }
      // Payer filter
      if (selectedPayer !== 'all' && exp.payerId !== selectedPayer) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const titleMatch = exp.title.toLowerCase().includes(term);
        const noteMatch = exp.note?.toLowerCase().includes(term);
        if (!titleMatch && !noteMatch) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
  }, [expenses, selectedMonth, selectedDate, selectedCategory, selectedPayer, searchTerm]);

  // Group expenses by date for Timeline view
  const groupedByDate = useMemo(() => {
    const groups: { [dateStr: string]: { date: string; expenses: Expense[]; totalAmount: number } } = {};
    filteredExpenses.forEach((exp) => {
      const d = exp.date || 'Khác';
      if (!groups[d]) {
        groups[d] = { date: d, expenses: [], totalAmount: 0 };
      }
      groups[d].expenses.push(exp);
      groups[d].totalAmount += exp.amount;
    });
    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredExpenses]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Handle Quick Add Submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setTableError(null);

    if (!newTitle.trim()) {
      setTableError('Vui lòng nhập nội dung khoản chi!');
      return;
    }

    const numAmount = parseInt(newAmount.replace(/\D/g, ''), 10) || 0;
    if (numAmount <= 0) {
      setTableError('Số tiền phải lớn hơn 0 ₫!');
      return;
    }

    if (!newPayerId) {
      setTableError('Vui lòng chọn người đã trả!');
      return;
    }

    if (newParticipants.length === 0) {
      setTableError('Vui lòng chọn ít nhất 1 người cùng chia!');
      return;
    }

    onAddExpense({
      title: newTitle.trim(),
      amount: numAmount,
      payerId: newPayerId,
      participants: newParticipants,
      category: newCategory,
      date: newDate || new Date().toISOString().split('T')[0],
      note: newNote.trim() || undefined,
    });

    // Reset inline input fields
    setNewTitle('');
    setNewAmount('');
    setNewNote('');
  };

  // Toggle quick row member checkbox
  const toggleQuickMember = (mId: MemberId) => {
    setTableError(null);
    if (newParticipants.includes(mId)) {
      if (newParticipants.length <= 1) {
        setTableError('Phải có ít nhất 1 người chịu khoản chi này!');
        return;
      }
      setNewParticipants(newParticipants.filter((id) => id !== mId));
    } else {
      setNewParticipants([...newParticipants, mId]);
    }
  };

  // Inline edit row handlers
  const startEditing = (exp: Expense) => {
    setTableError(null);
    setEditingRowId(exp.id);
    setEditFormData({ ...exp });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditFormData({});
    setTableError(null);
  };

  const saveInlineEdit = (expId: string) => {
    setTableError(null);
    if (!editFormData.title?.trim()) {
      setTableError('Nội dung không được để trống!');
      return;
    }
    if (!editFormData.amount || editFormData.amount <= 0) {
      setTableError('Số tiền phải lớn hơn 0!');
      return;
    }
    if (!editFormData.participants || editFormData.participants.length === 0) {
      setTableError('Cần ít nhất 1 người tham gia chia!');
      return;
    }

    const existing = expenses.find((e) => e.id === expId);
    if (existing) {
      onEditExpense({
        ...existing,
        title: editFormData.title.trim(),
        amount: editFormData.amount,
        payerId: editFormData.payerId || existing.payerId,
        participants: editFormData.participants,
        category: editFormData.category || existing.category,
        date: editFormData.date || existing.date,
        note: editFormData.note?.trim() || undefined,
        id: expId,
      });
    }
    setEditingRowId(null);
    setEditFormData({});
  };

  const toggleEditParticipant = (mId: MemberId) => {
    setTableError(null);
    const currentList = editFormData.participants || [];
    if (currentList.includes(mId)) {
      if (currentList.length <= 1) {
        setTableError('Phải có ít nhất 1 người chịu khoản chi này!');
        return;
      }
      setEditFormData({
        ...editFormData,
        participants: currentList.filter((id) => id !== mId),
      });
    } else {
      setEditFormData({
        ...editFormData,
        participants: [...currentList, mId],
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {tableError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{tableError}</span>
          </div>
          <button
            onClick={() => setTableError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters & Export Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">
              Lịch Sử Thu Chi
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">
              {filteredExpenses.length} khoản
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExpensesToCSV(filteredExpenses, members)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              title="Xuất bảng thu chi ra file Excel/CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel (.csv)</span>
            </button>

            <button
              onClick={() => setShowQuickRow(!showQuickRow)}
              className="hidden sm:flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showQuickRow ? 'Ẩn hàng nhập nhanh' : 'Mở hàng nhập nhanh'}</span>
            </button>
          </div>
        </div>

        {/* Chip Filter Section for Mobile & Desktop */}
        <div className="space-y-2.5 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung khoản chi, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category Chips Bar */}
          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">Danh mục:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            {Object.values(CATEGORIES).map((cat) => {
              const isSel = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    isSel
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Payer Chips Bar */}
          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">Người trả:</span>
            <button
              onClick={() => setSelectedPayer('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                selectedPayer === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Cả 4 người
            </button>
            {members.map((m) => {
              const isSel = selectedPayer === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedPayer(m.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSel
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${m.avatarBg}`}>
                    {m.avatarText}
                  </span>
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset Filter Button if active */}
        {(selectedMonth !== 'all' || selectedDate || selectedCategory !== 'all' || selectedPayer !== 'all' || searchTerm) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Đang hiển thị {filteredExpenses.length} / {expenses.length} khoản chi
            </span>
            <button
              onClick={() => {
                handleMonthChange('all');
                setSelectedDate('');
                setSelectedCategory('all');
                setSelectedPayer('all');
                setSearchTerm('');
              }}
              className="text-emerald-600 hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Mode Switcher */}
      <div className="flex sm:hidden items-center justify-between bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
        <button
          onClick={() => setMobileView('cards')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'cards'
              ? 'bg-white text-emerald-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📱 Dạng Thẻ Mobile</span>
        </button>
        <button
          onClick={() => setMobileView('table')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'table'
              ? 'bg-white text-emerald-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📊 Bảng Excel (Swipe)</span>
        </button>
      </div>

      {/* Mobile Card Timeline View (Visible when mobileView === 'cards' on mobile screens) */}
      {mobileView === 'cards' && (
        <div className="block sm:hidden space-y-4">
          {groupedByDate.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              Chưa có khoản chi tiêu nào khớp với bộ lọc
            </div>
          ) : (
            groupedByDate.map((group) => {
              const formattedDateHeader = (() => {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (group.date === today) return 'Hôm nay';
                if (group.date === yesterday) return 'Hôm qua';
                const parts = group.date.split('-');
                if (parts.length === 3) return `Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
                return group.date;
              })();

              return (
                <div key={group.date} className="space-y-2">
                  {/* Timeline Date Group Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formattedDateHeader}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">({group.expenses.length} khoản)</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {formatVND(group.totalAmount)}
                    </span>
                  </div>

                  {/* Expenses in this Date Group */}
                  <div className="space-y-2">
                    {group.expenses.map((exp) => {
                      const cat = CATEGORIES[exp.category] || CATEGORIES.other;
                      const payerMember = members.find((m) => m.id === exp.payerId);
                      const perPersonShare = Math.round(exp.amount / exp.participants.length);
                      const isExpanded = expandedCardId === exp.id;

                      return (
                        <div
                          key={exp.id}
                          className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5 hover:border-slate-300 transition-all active:bg-slate-50/80"
                        >
                          {/* Card Top Row: Category, Payer, Date Badge */}
                          <div
                            onClick={() => setSelectedDetailExpense(exp)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${cat.color}`}>
                                  {cat.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${payerMember?.avatarBg || 'bg-slate-400'}`} />
                                {payerMember?.name || exp.payerId} đã trả
                              </span>
                            </div>

                            {/* Expense Title & Amount */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <h3 className="font-bold text-slate-900 text-sm leading-snug">{exp.title}</h3>
                                {exp.note && <p className="text-xs text-slate-500 italic line-clamp-1">{exp.note}</p>}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-mono font-extrabold text-base text-emerald-700">
                                  {formatVND(exp.amount)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Mỗi ng: {formatVND(perPersonShare)} ({exp.participants.length} ng)
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Chips list for Huy, Nam, Nghĩa, Tuyên & Accordion toggle */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 flex-wrap">
                              {members.map((m) => {
                                const isSharing = exp.participants.includes(m.id);
                                return (
                                  <span
                                    key={m.id}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                      isSharing
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-slate-50 text-slate-300 border-slate-100 line-through opacity-40'
                                    }`}
                                  >
                                    {m.name}
                                  </span>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setExpandedCardId(isExpanded ? null : exp.id)}
                                className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 px-2 py-1 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                {isExpanded ? 'Thu gọn ▲' : 'Chi tiết ▼'}
                              </button>
                            </div>
                          </div>

                          {/* Accordion Detail Breakdown */}
                          {isExpanded && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2 animate-in fade-in duration-150">
                              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                                <span>Cách chia tiền chi tiết:</span>
                                <span className="text-[10px] text-slate-500 font-normal">Bấm mở rộng</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {members.map((m) => {
                                  const isSharing = exp.participants.includes(m.id);
                                  const isPayer = exp.payerId === m.id;
                                  return (
                                    <div
                                      key={m.id}
                                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                        isSharing
                                          ? 'bg-white border-slate-200 text-slate-800'
                                          : 'bg-slate-100/60 border-slate-200/50 text-slate-400 line-through'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${m.avatarBg}`}>
                                          {m.avatarText}
                                        </div>
                                        <span className="font-bold">{m.name}</span>
                                      </div>
                                      <span className="font-mono font-bold text-slate-700">
                                        {isSharing ? formatVND(perPersonShare) : '0 ₫'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                                <button
                                  onClick={() => {
                                    if (onOpenModalEdit) onOpenModalEdit(exp);
                                    else startEditing(exp);
                                  }}
                                  className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg text-xs flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Sửa khoản chi</span>
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(exp)}
                                  className="px-3 py-1 bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded-lg text-xs flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Spreadsheet Table Container (Always visible on Desktop; visible on Mobile when mobileView === 'table') */}
      <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${mobileView === 'cards' ? 'hidden sm:block' : 'block'}`}>
        {/* Mobile Swipe Hint */}
        <div className="block sm:hidden bg-amber-50 text-amber-800 border-b border-amber-200 px-3 py-1.5 text-[11px] font-medium text-center">
          💡 Mẹo: Vuốt ngang bảng để xem đầy đủ cột chi tiết của Huy, Nam, Nghĩa, Tuyên
        </div>

        {/* Total Banner for displayed expenses */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>BẢNG THU CHI TRONG KỲ:</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-emerald-400 font-mono">
              {filteredExpenses.length} khoản chi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Tổng tiền chi:</span>
            <span className="text-emerald-400 text-sm font-bold font-mono">
              {formatVND(totalFilteredAmount)}
            </span>
          </div>
        </div>

        {/* Horizontal Scroll Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            {/* Table Header Row */}
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 divide-x divide-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 w-28">Ngày</th>
                <th className="py-2.5 px-3 min-w-[160px]">Nội dung khoản chi</th>
                <th className="py-2.5 px-3 w-28">Loại chi phí</th>
                <th className="py-2.5 px-3 w-32 text-right">Số tiền (₫)</th>
                <th className="py-2.5 px-3 w-28">Người trả</th>
                <th className="py-2.5 px-3 w-12 text-center bg-emerald-50 text-emerald-900">Huy</th>
                <th className="py-2.5 px-3 w-12 text-center bg-blue-50 text-blue-900">Nam</th>
                <th className="py-2.5 px-3 w-12 text-center bg-amber-50 text-amber-900">Nghĩa</th>
                <th className="py-2.5 px-3 w-12 text-center bg-purple-50 text-purple-900">Tuyên</th>
                <th className="py-2.5 px-3 w-20 text-center">Số người</th>
                <th className="py-2.5 px-3 w-32 text-right">Mỗi người chịu</th>
                <th className="py-2.5 px-3 min-w-[120px]">Ghi chú</th>
                <th className="py-2.5 px-3 w-20 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {/* Quick Add Inline Form Row (Excel-like fast input) */}
              {showQuickRow && (
                <tr className="bg-emerald-50/60 border-b-2 border-emerald-300 divide-x divide-slate-200 text-slate-900 font-medium">
                  <td className="py-2 px-2 text-center font-bold text-emerald-700 text-[11px]">
                    + Mới
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      placeholder="Nhập nội dung chi..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                      className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {Object.values(CATEGORIES).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      placeholder="0"
                      value={
                        newAmount
                          ? parseInt(newAmount.replace(/\D/g, ''), 10).toLocaleString('vi-VN')
                          : ''
                      }
                      onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-right font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <select
                      value={newPayerId}
                      onChange={(e) => setNewPayerId(e.target.value as MemberId)}
                      className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 4 Checkboxes for Huy, Nam, Nghĩa, Tuyên */}
                  {members.map((m) => {
                    const isChecked = newParticipants.includes(m.id);
                    return (
                      <td key={m.id} className="py-1.5 px-2 text-center bg-slate-50/50">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleQuickMember(m.id)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </td>
                    );
                  })}

                  <td className="py-1.5 px-2 text-center font-bold text-slate-700">
                    {newParticipants.length}
                  </td>

                  <td className="py-1.5 px-2 text-right font-mono text-slate-600 font-semibold text-[11px]">
                    {newAmount && newParticipants.length > 0
                      ? formatVND(
                          Math.round(
                            (parseInt(newAmount.replace(/\D/g, ''), 10) || 0) /
                              newParticipants.length
                          )
                        )
                      : '0 ₫'}
                  </td>

                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      placeholder="Ghi chú..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </td>

                  <td className="py-1.5 px-2 text-center">
                    <button
                      onClick={handleQuickAdd}
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors shadow-xs flex items-center justify-center gap-1"
                      title="Lưu khoản chi"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Thêm</span>
                    </button>
                  </td>
                </tr>
              )}

              {/* Display Rows */}
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-400">
                    Chưa có dữ liệu thu chi nào trong danh sách.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, idx) => {
                  const isEditing = editingRowId === exp.id;
                  const categoryObj = CATEGORIES[exp.category] || CATEGORIES.other;
                  const payerMember = members.find((m) => m.id === exp.payerId);
                  const count = exp.participants ? exp.participants.length : 4;
                  const sharePerPerson = Math.round(exp.amount / count);

                  if (isEditing) {
                    return (
                      <tr
                        key={exp.id}
                        className="bg-amber-50/80 divide-x divide-slate-200 border-b border-amber-200"
                      >
                        <td className="py-2 px-2 text-center font-bold text-amber-800">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="date"
                            value={editFormData.date || exp.date}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, date: e.target.value })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={editFormData.title ?? exp.title}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, title: e.target.value })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={editFormData.category || exp.category}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                category: e.target.value as CategoryType,
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1 py-1 text-xs"
                          >
                            {Object.values(CATEGORIES).map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={editFormData.amount ?? exp.amount}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                amount: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-right font-bold"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={editFormData.payerId || exp.payerId}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                payerId: e.target.value as MemberId,
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1 py-1 text-xs"
                          >
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Edit Checkboxes */}
                        {members.map((m) => {
                          const isChecked = (editFormData.participants || exp.participants).includes(
                            m.id
                          );
                          return (
                            <td key={m.id} className="py-1.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEditParticipant(m.id)}
                                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                              />
                            </td>
                          );
                        })}

                        <td className="py-1.5 px-2 text-center font-bold">
                          {(editFormData.participants || exp.participants).length}
                        </td>

                        <td className="py-1.5 px-2 text-right font-mono text-xs">
                          {formatVND(
                            Math.round(
                              (editFormData.amount ?? exp.amount) /
                                (editFormData.participants || exp.participants).length
                            )
                          )}
                        </td>

                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={editFormData.note ?? exp.note ?? ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, note: e.target.value })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </td>

                        <td className="py-1.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveInlineEdit(exp.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Lưu"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/80 transition-colors divide-x divide-slate-200 text-slate-800"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {exp.title}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {categoryObj.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                        {formatVND(exp.amount)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800 whitespace-nowrap">
                        {payerMember?.name || exp.payerId}
                      </td>

                      {/* 4 Checkbox Indicators for Huy, Nam, Nghĩa, Tuyên */}
                      {members.map((m) => {
                        const isParticipating = exp.participants?.includes(m.id);
                        return (
                          <td key={m.id} className="py-2.5 px-3 text-center">
                            {isParticipating ? (
                              <span className="inline-block w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] leading-4 text-center">
                                ✓
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700 font-mono">
                        {count}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                        {formatVND(sharePerPerson)}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-xs italic truncate max-w-[150px]">
                        {exp.note || '-'}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              if (onOpenModalEdit) {
                                onOpenModalEdit(exp);
                              } else {
                                startEditing(exp);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Sửa khoản chi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(exp)}
                            className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Xóa khoản chi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer / Summary Row */}
            {filteredExpenses.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 divide-x divide-slate-200">
                  <td colSpan={4} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                    TỔNG CỘNG HIỂN THỊ:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">
                    {formatVND(totalFilteredAmount)}
                  </td>
                  <td colSpan={9} className="py-3 px-3 text-slate-500 text-xs font-normal">
                    (Gồm {filteredExpenses.length} khoản chi trong kỳ hiển thị)
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Mobile Slide-Up Bottom Sheet for Selected Expense Detail */}
      {selectedDetailExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${CATEGORIES[selectedDetailExpense.category]?.color || CATEGORIES.other.color}`}>
                  {CATEGORIES[selectedDetailExpense.category]?.name || 'Chi phí'}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {selectedDetailExpense.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailExpense(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount & Date */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium">Tổng tiền hóa đơn:</div>
                <div className="text-2xl font-black text-emerald-800 font-mono">
                  {formatVND(selectedDetailExpense.amount)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Ngày thực hiện:</div>
                <div className="text-xs font-bold text-slate-800">{selectedDetailExpense.date}</div>
              </div>
            </div>

            {/* Paid By Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Người đã đứng ra trả tiền:</span>
              <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                {members.find((m) => m.id === selectedDetailExpense.payerId)?.name || selectedDetailExpense.payerId}
              </span>
            </div>

            {/* Participants Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Chi tiết danh sách chia tiền ({selectedDetailExpense.participants.length} người cùng chia):
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {members.map((m) => {
                  const isSharing = selectedDetailExpense.participants.includes(m.id);
                  const shareAmount = isSharing
                    ? Math.round(selectedDetailExpense.amount / selectedDetailExpense.participants.length)
                    : 0;

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between ${
                        isSharing
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${m.avatarBg}`}>
                          {m.avatarText}
                        </div>
                        <span className="text-xs">{m.name}</span>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-emerald-800">
                        {isSharing ? formatVND(shareAmount) : '0 ₫'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDetailExpense.note && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Ghi chú:</span>
                {selectedDetailExpense.note}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  const target = selectedDetailExpense;
                  setSelectedDetailExpense(null);
                  if (onOpenModalEdit) onOpenModalEdit(target);
                  else startEditing(target);
                }}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                <span>Chỉnh sửa khoản chi</span>
              </button>

              <button
                onClick={() => {
                  const target = selectedDetailExpense;
                  setSelectedDetailExpense(null);
                  setDeleteTarget(target);
                }}
                className="w-1/2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa khoản chi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-100 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Xác nhận xóa khoản chi</h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{deleteTarget.title}</div>
              <div className="text-emerald-700 font-mono font-semibold">
                Số tiền: {formatVND(deleteTarget.amount)}
              </div>
              <div className="text-slate-500">
                Ngày: {deleteTarget.date} • Đã trả: {members.find((m) => m.id === deleteTarget.payerId)?.name || deleteTarget.payerId}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Khoản chi này sẽ bị xóa khỏi hệ thống và không thể khôi phục lại. Bạn có chắc chắn không?
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onDeleteExpense(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
