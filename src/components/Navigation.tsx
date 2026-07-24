import React from 'react';
import { Table, Calculator, ArrowRightLeft, PieChart, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  expenseCount: number;
  debtCount: number;
  auditCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  expenseCount,
  debtCount,
  auditCount = 0,
}) => {
  const tabs = [
    {
      id: 'excel' as ActiveTab,
      label: '1. Bảng THU CHI',
      icon: Table,
      badge: expenseCount > 0 ? expenseCount : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'summary' as ActiveTab,
      label: '2. Bảng TỔNG KẾT',
      icon: Calculator,
    },
    {
      id: 'settlement' as ActiveTab,
      label: '3. THANH TOÁN CÔNG NỢ',
      icon: ArrowRightLeft,
      badge: debtCount > 0 ? debtCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold',
    },
    {
      id: 'stats' as ActiveTab,
      label: 'Thống kê chi tiêu',
      icon: PieChart,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Lịch sử Sửa & Xóa',
      icon: ShieldCheck,
      badge: auditCount > 0 ? auditCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
  ];


  return (
    <nav className="bg-white border-b border-slate-200 sticky top-14 z-20 shadow-xs hidden sm:block">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 flex justify-start sm:justify-center gap-1 sm:gap-4 lg:gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 sm:px-5 border-b-2 text-xs sm:text-sm lg:text-base font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              id={`nav-tab-${tab.id}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 stroke-[2.5]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
