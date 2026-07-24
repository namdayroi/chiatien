import React, { useState } from 'react';
import { Calendar, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatMonthName } from '../utils/calculations';

interface AddMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMonths: string[];
  onAddMonth: (monthKey: string) => void;
}

export const AddMonthModal: React.FC<AddMonthModalProps> = ({
  isOpen,
  onClose,
  existingMonths,
  onAddMonth,
}) => {
  // Default to next month or current month
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${defaultYear}-${defaultMonth}`;

  // Calculate next month key
  const nextMonthObj = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextYear = nextMonthObj.getFullYear();
  const nextMonth = String(nextMonthObj.getMonth() + 1).padStart(2, '0');
  const nextMonthKey = `${nextYear}-${nextMonth}`;

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    existingMonths.includes(nextMonthKey) ? currentMonthKey : nextMonthKey
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonthKey) {
      setErrorMsg('Vui lòng chọn tháng!');
      return;
    }

    onAddMonth(selectedMonthKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tạo Bảng Chi Tiêu Tháng Mới</h3>
              <p className="text-xs text-slate-500">Phân chia thu chi theo từng tháng độc lập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-600">
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Suggestions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Gợi ý tạo tháng nhanh:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMonthKey(currentMonthKey)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  selectedMonthKey === currentMonthKey
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{formatMonthName(currentMonthKey)}</span>
                {existingMonths.includes(currentMonthKey) && (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Đã có</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMonthKey(nextMonthKey)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  selectedMonthKey === nextMonthKey
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{formatMonthName(nextMonthKey)}</span>
                {existingMonths.includes(nextMonthKey) && (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Đã có</span>
                )}
              </button>
            </div>
          </div>

          {/* Month Picker Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hoặc chọn tháng/năm tùy chỉnh:
            </label>
            <div className="relative">
              <input
                type="month"
                value={selectedMonthKey}
                onChange={(e) => {
                  setSelectedMonthKey(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Dynamic Info Preview */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bảng mới: {formatMonthName(selectedMonthKey)}</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed">
              Tạo bảng thu chi riêng cho {formatMonthName(selectedMonthKey)}. Các khoản chi và tính toán chia tiền sẽ được tự động gom nhóm độc lập trong tháng này.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tạo Bảng {formatMonthName(selectedMonthKey)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
