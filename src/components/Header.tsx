import React, { useState } from 'react';
import { Plus, Share2, RefreshCw, Trash2, Home, Users, Check, Copy } from 'lucide-react';
import { Member, Expense, MemberBalance, DebtTransaction } from '../types';
import { generateZaloReport } from '../utils/calculations';

interface HeaderProps {
  onOpenAddExpense: () => void;
  onResetData: () => void;
  onClearData: () => void;
  expenses: Expense[];
  members: Member[];
  balances: MemberBalance[];
  settlements: DebtTransaction[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddExpense,
  onResetData,
  onClearData,
  expenses,
  members,
  balances,
  settlements,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmType, setConfirmType] = useState<'reset' | 'clear' | null>(null);

  const reportText = generateZaloReport(expenses, members, balances, settlements);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-3 flex items-center justify-between">
            {/* App Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-sm">
                <Home className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold leading-snug tracking-tight text-white">
                    Chia Tiền Phòng
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Realtime Cloud
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>Huy • Nam • Nghĩa • Tuyên</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
                title="Sao chép đường link web để người khác mở và sửa chung"
                id="share-app-link-btn"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Đã chép Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Chia Sẻ Link Web</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-medium border border-slate-700/60 active:scale-95"
                title="Chia sẻ báo cáo Zalo"
                id="share-zalo-btn"
              >
                <Copy className="w-4 h-4 text-slate-300" />
                <span className="hidden md:inline">Báo cáo Zalo</span>
              </button>

            <button
              onClick={onOpenAddExpense}
              className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              id="add-expense-header-btn"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm chi tiêu</span>
            </button>

            {/* Overflow Menu for options */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                title="Tùy chọn khác"
                id="menu-toggle-btn"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setConfirmType('reset');
                    }}
                    className="w-full text-left px-3 py-2.5 text-slate-200 hover:bg-slate-700/70 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nạp dữ liệu mẫu</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setConfirmType('clear');
                    }}
                    className="w-full text-left px-3 py-2.5 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 border-t border-slate-700/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả chi tiêu</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Share to Zalo Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Báo cáo công nợ Zalo/Messenger</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Sao chép tin nhắn bên dưới và dán vào nhóm Zalo hoặc Messenger của phòng để báo tổng kết:
            </p>

            <div className="bg-slate-950 rounded-xl p-3 text-xs font-mono text-slate-300 border border-slate-800 whitespace-pre-wrap max-h-64 overflow-y-auto select-all leading-relaxed">
              {reportText}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopyReport}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép vào khay nhớ tạm</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset / Clear Modal */}
      {confirmType && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-full ${
                  confirmType === 'clear'
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                }`}
              >
                {confirmType === 'clear' ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </div>
              <h3 className="font-bold text-base text-white">
                {confirmType === 'clear' ? 'Xóa tất cả chi tiêu?' : 'Nạp lại dữ liệu mẫu?'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmType === 'clear'
                ? 'Thao tác này sẽ xóa toàn bộ dữ liệu khoản chi hiện tại khỏi máy. Thao tác này không thể hoàn tác!'
                : 'Thao tác này sẽ khôi phục danh sách các khoản chi tiêu mẫu ban đầu cho Huy, Nam, Nghĩa, Tuyên.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmType(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (confirmType === 'clear') {
                    onClearData();
                  } else {
                    onResetData();
                  }
                  setConfirmType(null);
                }}
                className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-colors ${
                  confirmType === 'clear'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {confirmType === 'clear' ? 'Xóa sạch' : 'Nạp dữ liệu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
