import React, { useState } from 'react';
import {
  ShieldCheck,
  History,
  Trash2,
  Edit3,
  PlusCircle,
  RotateCcw,
  Search,
  Lock,
  Calendar,
  User,
  Info,
  CheckCircle2,
  ArrowRight,
  Eye
} from 'lucide-react';
import { AuditLog, Member, Expense, AuditAction } from '../types';
import { formatVND } from '../utils/calculations';
import { CATEGORIES } from '../utils/constants';

interface AuditHistoryTableProps {
  logs: AuditLog[];
  members: Member[];
  onRestoreExpense: (expense: Expense) => void;
  activeExpenses: Expense[];
}

export const AuditHistoryTable: React.FC<AuditHistoryTableProps> = ({
  logs,
  members,
  onRestoreExpense,
  activeExpenses,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDetailLog, setSelectedDetailLog] = useState<AuditLog | null>(null);
  const [restoredSuccessMsg, setRestoredSuccessMsg] = useState<string | null>(null);

  // Helper member map
  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  // Compute stats
  const totalLogs = logs.length;
  const deleteCount = logs.filter((l) => l.action === 'DELETE').length;
  const editCount = logs.filter((l) => l.action === 'EDIT').length;
  const createCount = logs.filter((l) => l.action === 'CREATE').length;
  const restoreCount = logs.filter((l) => l.action === 'RESTORE').length;

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchTitle = log.expenseTitle.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const payerObj = memberMap.get(log.payerId);
      const matchPayer = payerObj ? payerObj.name.toLowerCase().includes(q) : false;
      return matchTitle || matchDetails || matchPayer;
    }
    return true;
  });

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2.5 py-1 rounded-xl text-xs">
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Đã xóa
          </span>
        );
      case 'EDIT':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-1 rounded-xl text-xs">
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            Đã chỉnh sửa
          </span>
        );
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded-xl text-xs">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            Tạo mới
          </span>
        );
      case 'RESTORE':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 border border-sky-300 font-bold px-2.5 py-1 rounded-xl text-xs">
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            Đã khôi phục
          </span>
        );
    }
  };

  const handleRestore = (log: AuditLog) => {
    if (!log.previousExpense && !log.newExpense) return;
    const targetExp = log.previousExpense || log.newExpense;
    if (!targetExp) return;

    // Check if already active in current expenses
    const exists = activeExpenses.some((e) => e.id === targetExp.id);

    if (
      window.confirm(
        `Khôi phục lại khoản chi "${targetExp.title}" (${formatVND(targetExp.amount)}) vào Bảng Thu Chi?`
      )
    ) {
      onRestoreExpense({
        ...targetExp,
        // Ensure new ID if already existing to avoid duplicate key conflicts
        id: exists ? `exp_restored_${Date.now()}` : targetExp.id,
      });
      setRestoredSuccessMsg(`Đã khôi phục khoản chi "${targetExp.title}" thành công!`);
      setTimeout(() => setRestoredSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Permanent Security Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">
                  Lịch Sử Chỉnh Sửa & Xóa Thu Chi
                </h2>
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Bảo mật vĩnh viễn
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Mọi thao tác <strong className="text-emerald-400">Tạo mới</strong>,{' '}
                <strong className="text-amber-400">Chỉnh sửa</strong>, và{' '}
                <strong className="text-rose-400">Xóa khoản chi</strong> đều được tự động lưu trữ vĩnh viễn vào nhật ký hệ thống và{' '}
                <u className="text-amber-300 decoration-amber-400">không thể bị xóa bỏ</u>. Bạn có thể kiểm tra hoặc khôi phục bất cứ lúc nào.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="text-center px-2">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Tổng nhật ký</div>
              <div className="text-lg font-black text-white font-mono">{totalLogs}</div>
            </div>
            <div className="h-7 w-px bg-slate-700" />
            <div className="text-center px-2">
              <div className="text-rose-400 text-[10px] font-bold uppercase">Đã xóa</div>
              <div className="text-lg font-black text-rose-400 font-mono">{deleteCount}</div>
            </div>
            <div className="h-7 w-px bg-slate-700" />
            <div className="text-center px-2">
              <div className="text-amber-400 text-[10px] font-bold uppercase">Đã sửa</div>
              <div className="text-lg font-black text-amber-400 font-mono">{editCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {restoredSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs p-3.5 rounded-2xl flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{restoredSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setFilterAction('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterAction === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({totalLogs})
            </button>
            <button
              onClick={() => setFilterAction('DELETE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                filterAction === 'DELETE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Đã xóa ({deleteCount})
            </button>
            <button
              onClick={() => setFilterAction('EDIT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                filterAction === 'EDIT'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Đã sửa ({editCount})
            </button>
            <button
              onClick={() => setFilterAction('CREATE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                filterAction === 'CREATE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Thêm mới ({createCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo nội dung, tên khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
          <h3 className="font-bold text-slate-700 text-base">Chưa có nhật ký nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Khi bạn hoặc thành viên chỉnh sửa hoặc xóa bất kỳ khoản chi tiêu nào, lịch sử chi tiết sẽ tự động lưu lại tại đây vĩnh viễn.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const payerObj = memberMap.get(log.payerId);
              const formattedTime = new Date(log.timestamp).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action)}
                      <span className="font-bold text-slate-900 text-sm">{log.expenseTitle}</span>
                      <span className="font-mono font-extrabold text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {formatVND(log.amount)}
                      </span>
                      {payerObj && (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${payerObj.avatarBg}`}
                        >
                          {payerObj.name} trả
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formattedTime}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">ID: {log.expenseId}</span>
                    </div>
                  </div>

                  {/* Actions for Log Entry */}
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {(log.action === 'DELETE' || log.action === 'EDIT') &&
                      (log.previousExpense || log.newExpense) && (
                        <button
                          onClick={() => handleRestore(log)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                          title="Khôi phục khoản chi này về Bảng Thu Chi"
                        >
                          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Phục hồi</span>
                        </button>
                      )}

                    <button
                      onClick={() => setSelectedDetailLog(log)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chi tiết</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedDetailLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Chi Tiết Nhật Ký Hệ Thống</h3>
              </div>
              <button
                onClick={() => setSelectedDetailLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Hành động:</span>
                {getActionBadge(selectedDetailLog.action)}
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                <span className="text-slate-500 font-medium font-sans">Thời gian thực hiện:</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedDetailLog.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium block">Nội dung ghi nhận:</span>
                <p className="font-bold text-slate-900 text-sm">{selectedDetailLog.details}</p>
              </div>

              {/* Show Previous vs New if EDIT */}
              {selectedDetailLog.previousExpense && selectedDetailLog.newExpense && (
                <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-slate-50/50">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    So sánh dữ liệu trước & sau khi chỉnh sửa:
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl space-y-1">
                      <div className="font-bold text-rose-800 text-[10px] uppercase">Dữ liệu CŨ (Trước khi sửa)</div>
                      <div className="font-bold text-slate-900">{selectedDetailLog.previousExpense.title}</div>
                      <div className="font-mono font-extrabold text-rose-700">
                        {formatVND(selectedDetailLog.previousExpense.amount)}
                      </div>
                      <div className="text-[11px] text-slate-500">Ngày: {selectedDetailLog.previousExpense.date}</div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl space-y-1">
                      <div className="font-bold text-emerald-800 text-[10px] uppercase">Dữ liệu MỚI (Sau khi sửa)</div>
                      <div className="font-bold text-slate-900">{selectedDetailLog.newExpense.title}</div>
                      <div className="font-mono font-extrabold text-emerald-700">
                        {formatVND(selectedDetailLog.newExpense.amount)}
                      </div>
                      <div className="text-[11px] text-slate-500">Ngày: {selectedDetailLog.newExpense.date}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedDetailLog(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
