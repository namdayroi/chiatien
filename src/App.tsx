import React, { useState, useEffect } from 'react';
import { Plus, Table, Calculator, ArrowRightLeft, PieChart, ShieldCheck } from 'lucide-react';
import { Member, Expense, ActiveTab, AuditLog } from './types';
import {
  getStoredMembers,
  getStoredExpenses,
  saveExpenses,
  getStoredMonths,
  saveMonths,
  getStoredAuditLogs,
  createAuditEntry,
  resetToSampleData,
  clearAllData,
} from './utils/storage';
import {
  subscribeExpenses,
  subscribeMonths,
  subscribeAuditLogs,
  syncSaveExpense,
  syncDeleteExpense,
  syncAddMonth,
  syncDeleteMonth,
  syncSaveAuditLog,
} from './lib/firebase';
import { calculateBalances, calculateDebtSettlement } from './utils/calculations';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MonthTabs } from './components/MonthTabs';
import { AddMonthModal } from './components/AddMonthModal';
import { ExcelTable } from './components/ExcelTable';
import { SummaryTable } from './components/SummaryTable';
import { DebtSettlement } from './components/DebtSettlement';
import { ExpenseStats } from './components/ExpenseStats';
import { AuditHistoryTable } from './components/AuditHistoryTable';
import { AddExpenseModal } from './components/AddExpenseModal';

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('excel');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMonthModalOpen, setIsAddMonthModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Load stored local data on mount and subscribe to Firestore Realtime
  useEffect(() => {
    const loadedMembers = getStoredMembers();
    const loadedExpenses = getStoredExpenses();
    const storedMonths = getStoredMonths();
    const loadedAudit = getStoredAuditLogs();

    // Extract unique YYYY-MM months from loaded expenses and combine with stored custom months
    const uniqueMonths = new Set<string>(storedMonths);
    loadedExpenses.forEach((e) => {
      if (e.date) {
        uniqueMonths.add(e.date.substring(0, 7));
      }
    });

    const sortedMonths = Array.from(uniqueMonths).sort().reverse();
    setMembers(loadedMembers);
    setExpenses(loadedExpenses);
    setMonths(sortedMonths.length > 0 ? sortedMonths : ['2026-07']);
    setAuditLogs(loadedAudit);

    // Set default month to current month if present, otherwise latest month
    const todayMonthKey = new Date().toISOString().substring(0, 7);
    if (sortedMonths.includes(todayMonthKey)) {
      setSelectedMonth(todayMonthKey);
    } else if (sortedMonths.length > 0) {
      setSelectedMonth(sortedMonths[0]);
    } else {
      setSelectedMonth('2026-07');
    }

    // --- REALTIME FIRESTORE SUBSCRIPTIONS ---
    // Anyone opening the shared link will receive live edits immediately
    const unsubExpenses = subscribeExpenses((remoteExpenses) => {
      if (remoteExpenses && remoteExpenses.length > 0) {
        setExpenses(remoteExpenses);
        saveExpenses(remoteExpenses);
      }
    });

    const unsubMonths = subscribeMonths((remoteMonths) => {
      if (remoteMonths && remoteMonths.length > 0) {
        setMonths(remoteMonths);
        saveMonths(remoteMonths);
      }
    });

    const unsubAudit = subscribeAuditLogs((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setAuditLogs(remoteLogs);
      }
    });

    return () => {
      unsubExpenses();
      unsubMonths();
      unsubAudit();
    };
  }, []);

  // Save expenses on change
  const handleSaveExpensesState = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    saveExpenses(newExpenses);

    // Auto-discover new months from new expenses
    const updatedMonths = new Set<string>(months);
    newExpenses.forEach((e) => {
      if (e.date) {
        const mKey = e.date.substring(0, 7);
        updatedMonths.add(mKey);
        syncAddMonth(mKey);
      }
    });
    const sorted = Array.from(updatedMonths).sort().reverse();
    setMonths(sorted);
    saveMonths(sorted);
  };

  // Add new Month sheet
  const handleAddMonth = (monthKey: string) => {
    const updatedMonths = Array.from(new Set([monthKey, ...months])).sort().reverse();
    setMonths(updatedMonths);
    saveMonths(updatedMonths);
    syncAddMonth(monthKey);
    setSelectedMonth(monthKey);
  };

  // Delete empty Month sheet
  const handleDeleteMonth = (monthKey: string) => {
    const updatedMonths = months.filter((m) => m !== monthKey);
    setMonths(updatedMonths);
    saveMonths(updatedMonths);
    syncDeleteMonth(monthKey);
    if (selectedMonth === monthKey) {
      setSelectedMonth(updatedMonths.length > 0 ? updatedMonths[0] : 'all');
    }
  };

  // Add or Edit Expense with Audit Logging & Firestore Sync
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'> & { id?: string; createdAt?: number },
    editId?: string
  ) => {
    const targetId = editId || expenseData.id;
    if (targetId) {
      // Edit existing expense
      const previousExp = expenses.find((e) => e.id === targetId);
      const updatedExp: Expense = {
        title: expenseData.title,
        amount: expenseData.amount,
        payerId: expenseData.payerId,
        participants: expenseData.participants,
        category: expenseData.category,
        date: expenseData.date,
        note: expenseData.note,
        id: targetId,
        createdAt: previousExp ? previousExp.createdAt : Date.now(),
      };

      const updated = expenses.map((e) => (e.id === targetId ? updatedExp : e));
      handleSaveExpensesState(updated);
      syncSaveExpense(updatedExp);

      if (previousExp) {
        const auditLog = createAuditEntry('EDIT', updatedExp, previousExp);
        setAuditLogs(getStoredAuditLogs());
        syncSaveAuditLog(auditLog);
      }
    } else {
      // Create new expense
      const newExp: Expense = {
        title: expenseData.title,
        amount: expenseData.amount,
        payerId: expenseData.payerId,
        participants: expenseData.participants,
        category: expenseData.category,
        date: expenseData.date,
        note: expenseData.note,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      handleSaveExpensesState([newExp, ...expenses]);
      syncSaveExpense(newExp);

      const auditLog = createAuditEntry('CREATE', newExp);
      setAuditLogs(getStoredAuditLogs());
      syncSaveAuditLog(auditLog);
    }
    setEditingExpense(null);
  };

  // Edit Expense direct trigger
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  // Delete Expense with Audit Logging & Firestore Sync
  const handleDeleteExpense = (id: string) => {
    const targetExp = expenses.find((e) => e.id === id);
    if (targetExp) {
      const auditLog = createAuditEntry('DELETE', targetExp);
      setAuditLogs(getStoredAuditLogs());
      syncSaveAuditLog(auditLog);
    }
    const updated = expenses.filter((e) => e.id !== id);
    handleSaveExpensesState(updated);
    syncDeleteExpense(id);
  };

  // Restore Expense from Audit History
  const handleRestoreExpense = (restoredExpense: Expense) => {
    handleSaveExpensesState([restoredExpense, ...expenses]);
    syncSaveExpense(restoredExpense);

    const auditLog = createAuditEntry('RESTORE', restoredExpense);
    setAuditLogs(getStoredAuditLogs());
    syncSaveAuditLog(auditLog);
  };

  // Reset to Sample Data
  const handleResetData = () => {
    const res = resetToSampleData();
    setMembers(res.members);
    setExpenses(res.expenses);
    setMonths(res.months);
    setSelectedMonth('2026-07');
  };

  // Clear All Data (Note: Audit Logs are preserved in storage)
  const handleClearData = () => {
    // Log a deletion event for all cleared expenses
    expenses.forEach((e) => {
      createAuditEntry('DELETE', e, undefined, `Xóa khoản chi "${e.title}" khi làm sạch dữ liệu`);
    });

    const res = clearAllData();
    setMembers(res.members);
    setExpenses(res.expenses);
    setMonths(res.months);
    setAuditLogs(getStoredAuditLogs());
    setSelectedMonth('2026-07');
  };


  // Filter expenses by selected month for calculation of balances, debt settlements, and stats
  const filteredExpenses =
    selectedMonth === 'all'
      ? expenses
      : expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));

  // Calculate balances and settlements dynamically for the selected month table
  const balances = calculateBalances(members, filteredExpenses);
  const debtSettlements = calculateDebtSettlement(balances);

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* App Header */}
      <Header
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        onResetData={handleResetData}
        onClearData={handleClearData}
        expenses={filteredExpenses}
        members={members}
        balances={balances}
        settlements={debtSettlements}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expenseCount={filteredExpenses.length}
        debtCount={debtSettlements.length}
        auditCount={auditLogs.length}
      />

      {/* Month Sheet Tabs Bar */}
      <MonthTabs
        months={months}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onOpenAddMonthModal={() => setIsAddMonthModalOpen(true)}
        onDeleteMonth={handleDeleteMonth}
        expenses={expenses}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 pb-24">
        {/* Section 1: Excel Spreadsheet Table */}
        {activeTab === 'excel' && (
          <ExcelTable
            expenses={expenses}
            members={members}
            onAddExpense={(expData) => handleSaveExpense(expData)}
            onEditExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenModalEdit={handleEditExpense}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            allMonths={months}
            onOpenAddMonthModal={() => setIsAddMonthModalOpen(true)}
          />
        )}

        {/* Section 2: Summary Table for Huy, Nam, Nghĩa, Tuyên */}
        {activeTab === 'summary' && (
          <SummaryTable
            balances={balances}
            expenses={filteredExpenses}
            selectedMonth={selectedMonth}
          />
        )}

        {/* Section 3: Optimized Debt Settlement */}
        {activeTab === 'settlement' && (
          <DebtSettlement
            settlements={debtSettlements}
            onAddExpense={(expData) => handleSaveExpense(expData)}
            selectedMonth={selectedMonth}
          />
        )}

        {/* Section 4: Visual Stats & Analytics */}
        {activeTab === 'stats' && (
          <ExpenseStats
            expenses={filteredExpenses}
            members={members}
            balances={balances}
            selectedMonth={selectedMonth}
          />
        )}

        {/* Section 5: Audit History Table (Cannot be deleted) */}
        {activeTab === 'history' && (
          <AuditHistoryTable
            logs={auditLogs}
            members={members}
            onRestoreExpense={handleRestoreExpense}
            activeExpenses={expenses}
          />
        )}
      </main>


      {/* Mobile Floating Action Button & Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-300 px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'summary' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px]">Tổng quan</span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'excel' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Table className="w-5 h-5" />
              {filteredExpenses.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 rounded-full">
                  {filteredExpenses.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Lịch sử</span>
          </button>

          {/* Prominent central + button for quick step-by-step add expense on mobile */}
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsAddModalOpen(true);
            }}
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg flex items-center justify-center transition-transform active:scale-90 border-2 border-slate-900 -mt-5"
            title="Thêm khoản chi mới"
            id="mobile-nav-add-btn"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'settlement' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <ArrowRightLeft className="w-5 h-5" />
              {debtSettlements.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full">
                  {debtSettlements.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Công nợ</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'history' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-[10px]">Nhật ký</span>
          </button>
        </div>
      </div>


      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSaveExpense={handleSaveExpense}
        members={members}
        initialExpense={editingExpense}
        defaultMonthKey={selectedMonth}
      />

      {/* Add Month Sheet Modal */}
      <AddMonthModal
        isOpen={isAddMonthModalOpen}
        onClose={() => setIsAddMonthModalOpen(false)}
        existingMonths={months}
        onAddMonth={handleAddMonth}
      />
    </div>
  );
}
