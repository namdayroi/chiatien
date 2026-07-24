import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Copy, Check, ShieldCheck, Sparkles, AlertCircle, Info, Calendar } from 'lucide-react';
import { DebtTransaction, Expense } from '../types';
import { formatVND, formatMonthName } from '../utils/calculations';

interface DebtSettlementProps {
  settlements: DebtTransaction[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  selectedMonth?: string;
}

export const DebtSettlement: React.FC<DebtSettlementProps> = ({ settlements, onAddExpense, selectedMonth }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [settlingIndex, setSettlingIndex] = useState<number | null>(null);
  const [confirmSettle, setConfirmSettle] = useState<{ st: DebtTransaction; index: number } | null>(null);

  const handleCopyNote = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleConfirmSettle = () => {
    if (!confirmSettle) return;
    const { st, index } = confirmSettle;

    setSettlingIndex(index);
    // Create a balancing expense: "st.from" pays "st.amount" for only "st.to"
    onAddExpense({
      title: `Thanh toán công nợ (${st.from.name} trả ${st.to.name})`,
      amount: st.amount,
      payerId: st.from.id,
      participants: [st.to.id],
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      note: `Xác nhận chuyển khoản thanh toán giữa ${st.from.name} và ${st.to.name}`,
    });

    setConfirmSettle(null);
    setTimeout(() => {
      setSettlingIndex(null);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Month Banner */}
      {selectedMonth && (
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-4 shadow-sm flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">
              Quyết Toán Công Nợ: {formatMonthName(selectedMonth)}
            </span>
          </div>
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold px-2.5 py-1 rounded-xl">
            {settlements.length > 0 ? `${settlements.length} giao dịch cần trả` : 'Đã sòng phẳng'}
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              3. DANH SÁCH THANH TOÁN CÔNG NỢ TỐI ƯU
            </h2>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              Tự động khớp lệnh bù trừ số tiền giữa 4 người (Huy, Nam, Nghĩa, Tuyên). Giúp giảm tối đa số lần chuyển khoản. Sau khi chuyển hết danh sách này, công nợ cả nhóm về <strong>0 ₫</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Settlements List */}
      {settlements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tất cả đã sòng phẳng!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Hiện tại cả 4 người (Huy, Nam, Nghĩa, Tuyên) đều không còn ai nợ ai. Bạn có thể tiếp tục thêm các khoản chi mới vào Bảng THU CHI.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold">Cần thực hiện {settlements.length} giao dịch chuyển khoản:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Thuật toán khớp nợ tối ưu
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {settlements.map((st, idx) => {
              const transferNote = `${st.from.name} tra tien phong cho ${st.to.name}`;
              const isSettling = settlingIndex === idx;

              return (
                <div
                  key={`${st.from.id}-${st.to.id}-${idx}`}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm space-y-4"
                >
                  {/* Visual Debt Bar Header */}
                  <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="text-amber-400">⚡</span>
                      <span>{st.from.name} cần chuyển trả {st.to.name}:</span>
                    </span>
                    <span className="text-emerald-400 font-mono font-extrabold text-sm">
                      {formatVND(st.amount)}
                    </span>
                  </div>

                  {/* From -> To Row */}
                  <div className="flex items-center justify-between gap-2">
                    {/* From Person (Debtor - Chuyển đi) */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border ${st.from.avatarBg}`}
                      >
                        {st.from.avatarText}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-rose-600">{st.from.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Cần trả tiền</div>
                      </div>
                    </div>

                    {/* Transfer Arrow & Amount */}
                    <div className="flex flex-col items-center justify-center px-2">
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shadow-xs mb-1 font-mono">
                        {formatVND(st.amount)}
                      </div>
                      <div className="flex items-center text-emerald-700 text-xs font-bold gap-1">
                        <span>chuyển cho</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* To Person (Creditor - Nhận tiền) */}
                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <div className="font-bold text-sm text-emerald-700">{st.to.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Được nhận lại</div>
                      </div>
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border ${st.to.avatarBg}`}
                      >
                        {st.to.avatarText}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Note & Action */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-slate-500 block text-[10px]">Nội dung CK đề xuất:</span>
                        <span className="font-mono text-slate-900 select-all font-semibold">
                          {transferNote}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyNote(transferNote, idx)}
                        className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Chép lời nhắn</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setConfirmSettle({ st, index: idx })}
                        disabled={isSettling}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Xác nhận đã CK</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm Settlement Modal */}
      {confirmSettle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2.5 rounded-full bg-emerald-100 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Xác nhận đã chuyển khoản</h3>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{confirmSettle.st.from.name}</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
                <span>{confirmSettle.st.to.name}</span>
              </div>
              <div className="text-emerald-800 font-mono text-sm font-extrabold pt-1">
                Số tiền: {formatVND(confirmSettle.st.amount)}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Hệ thống sẽ tự động ghi nhận một khoản thanh toán sòng phẳng cho {confirmSettle.st.from.name} và bù trừ dư nợ của {confirmSettle.st.to.name}.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmSettle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmSettle}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Xác nhận ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
