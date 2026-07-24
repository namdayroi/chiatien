import React, { useState, useEffect } from 'react';
import { X, Check, Users, DollarSign, Calendar, FileText, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Member, CategoryType, Expense, MemberId } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatVND } from '../utils/calculations';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>, editId?: string) => void;
  members: Member[];
  initialExpense?: Expense | null;
  defaultMonthKey?: string;
}

const QUICK_TITLES = [
  'Tiền điện tháng này',
  'Tiền nước sinh hoạt',
  'Mạng WiFi Internet',
  'Tiền phòng / Tiền nhà',
  'Đi chợ / Mua đồ ăn chung',
  'Nạp 4 bình nước uống',
  'Dầu ăn & Gia vị bếp',
  'Nước rửa chén & Đồ W/C',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  members,
  initialExpense,
  defaultMonthKey,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<CategoryType>('electricity');
  const [payerId, setPayerId] = useState<MemberId>('huy');
  const [participants, setParticipants] = useState<MemberId[]>(['huy', 'nam', 'nghia', 'tuyen']);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    setStep(1);
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmountStr(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setPayerId(initialExpense.payerId);
      setParticipants(initialExpense.participants || ['huy', 'nam', 'nghia', 'tuyen']);
      setDate(initialExpense.date);
      setNote(initialExpense.note || '');
    } else {
      setTitle('');
      setAmountStr('');
      setCategory('electricity');
      setPayerId('huy');
      setParticipants(['huy', 'nam', 'nghia', 'tuyen']);
      
      const todayISO = new Date().toISOString().split('T')[0];
      if (defaultMonthKey && defaultMonthKey !== 'all') {
        if (todayISO.startsWith(defaultMonthKey)) {
          setDate(todayISO);
        } else {
          setDate(`${defaultMonthKey}-01`);
        }
      } else {
        setDate(todayISO);
      }
      setNote('');
    }
  }, [initialExpense, isOpen, defaultMonthKey]);

  if (!isOpen) return null;

  const parseAmount = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const currentAmount = parseAmount(amountStr);

  const handleAddQuickAmount = (addVal: number) => {
    setAmountStr((currentAmount + addVal).toString());
    setErrorMsg(null);
  };

  const handleToggleParticipant = (mId: MemberId) => {
    setErrorMsg(null);
    if (participants.includes(mId)) {
      if (participants.length <= 1) {
        setErrorMsg('Phải có ít nhất 1 người chịu khoản chi này!');
        return;
      }
      setParticipants(participants.filter((id) => id !== mId));
    } else {
      setParticipants([...participants, mId]);
    }
  };

  const handleSelectAllParticipants = () => {
    setErrorMsg(null);
    if (participants.length === members.length) {
      setParticipants([payerId]);
    } else {
      setParticipants(members.map((m) => m.id));
    }
  };

  // Exact remainder money rounding calculation
  const sharePerPersonBase = participants.length > 0 ? Math.floor(currentAmount / participants.length) : 0;
  const remainder = participants.length > 0 ? currentAmount % participants.length : 0;

  const handleNextStep1 = () => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập nội dung khoản chi!');
      return;
    }
    if (currentAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền lớn hơn 0 ₫!');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setErrorMsg(null);
    if (!payerId) {
      setErrorMsg('Vui lòng chọn người đã đứng ra thanh toán!');
      return;
    }
    setStep(3);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập nội dung khoản chi!');
      setStep(1);
      return;
    }

    if (currentAmount <= 0) {
      setErrorMsg('Số tiền phải lớn hơn 0 ₫!');
      setStep(1);
      return;
    }

    if (!payerId) {
      setErrorMsg('Vui lòng chọn người đã đứng ra thanh toán!');
      setStep(2);
      return;
    }

    if (participants.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 người tham gia chia!');
      setStep(3);
      return;
    }

    onSaveExpense(
      {
        title: title.trim(),
        amount: currentAmount,
        payerId,
        participants,
        category,
        date,
        note: note.trim() || undefined,
      },
      initialExpense?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden mb-1" />

        {/* Modal Header & Wizard Step Progress Bar */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  {initialExpense ? 'Sửa khoản chi' : 'Thêm khoản chi mới'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {step === 1 && 'Bước 1/3: Số tiền & Nội dung'}
                  {step === 2 && 'Bước 2/3: Người đã trả tiền'}
                  {step === 3 && 'Bước 3/3: Danh sách chia tiền'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar steps */}
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`h-1.5 rounded-full transition-all ${
                step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                if (title && currentAmount > 0) setStep(2);
              }}
              className={`h-1.5 rounded-full transition-all ${
                step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                if (title && currentAmount > 0 && payerId) setStep(3);
              }}
              className={`h-1.5 rounded-full transition-all ${
                step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-3 py-2 rounded-xl flex items-center justify-between animate-in fade-in">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-900 ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* --- STEP 1: SỐ TIỀN & NỘI DUNG --- */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Amount Input with Numeric Keypad Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Số tiền chi (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={currentAmount ? currentAmount.toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setAmountStr(cleaned);
                  }}
                  className="w-full bg-slate-50 border-2 border-emerald-500/30 rounded-2xl pl-10 pr-12 py-3 text-2xl font-black text-emerald-700 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white shadow-xs"
                  autoFocus
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-extrabold">VNĐ</span>
              </div>

              {/* Quick Keypad Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[10000, 50000, 100000, 200000, 500000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddQuickAmount(val)}
                    className="text-xs py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-mono font-bold active:scale-95 transition-all"
                  >
                    +{(val / 1000).toLocaleString()}k
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Xóa số tiền
                </button>
              </div>
            </div>

            {/* Quick Suggestion Titles */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                2. Nội dung khoản chi <span className="text-rose-500">*</span>
              </label>
              <div className="relative mb-2">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="VD: Tiền điện tháng 7, Nước lọc, Đi chợ mua rau..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_TITLES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setTitle(q);
                      if (q.includes('điện')) setCategory('electricity');
                      else if (q.includes('nước')) setCategory('water');
                      else if (q.includes('Mạng') || q.includes('WiFi')) setCategory('internet');
                      else if (q.includes('phòng') || q.includes('nhà')) setCategory('rent');
                      else if (q.includes('chợ') || q.includes('ăn')) setCategory('food');
                      else setCategory('other');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition-colors border border-slate-200/60"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                3. Loại danh mục
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(CATEGORIES).map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as CategoryType)}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Note Optional */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ngày chi</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ghi chú (Nếu có)</label>
                <input
                  type="text"
                  placeholder="Ghi chú..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleNextStep1}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <span>Tiếp tục (Chọn người trả)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: CHỌN NGƯỜI ĐÃ TRẢ --- */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-sans">Khoản chi: <strong>{title}</strong></span>
              <span className="font-extrabold text-emerald-800 text-sm">{formatVND(currentAmount)}</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Ai là người đã đứng ra trả tiền? <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Chọn người đã ứng trước số tiền {formatVND(currentAmount)} này
              </p>

              <div className="grid grid-cols-2 gap-3">
                {members.map((m) => {
                  const isPayer = payerId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayerId(m.id)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                        isPayer
                          ? 'bg-emerald-500 text-slate-950 border-emerald-600 shadow-md ring-4 ring-emerald-500/20 font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black border-2 ${
                          isPayer ? 'bg-slate-950 text-white border-slate-900' : `${m.avatarBg}`
                        }`}
                      >
                        {m.avatarText}
                      </div>
                      <span className="text-sm tracking-wide">{m.name}</span>
                      {isPayer && (
                        <span className="text-[10px] bg-slate-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Đã ứng tiền
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>Quay lại</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <span>Tiếp tục (Chọn người chịu)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: CHỌN NHỮNG NGƯỜI CÙNG CHỊU & HIỂN THỊ CHIA TIỀN --- */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Người trả tiền:</span>
                <strong className="text-emerald-400 font-bold">
                  {members.find((m) => m.id === payerId)?.name} ({formatVND(currentAmount)})
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-[11px] text-slate-300 underline font-medium"
              >
                Đổi người trả
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Những ai cùng chịu khoản chi này?</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllParticipants}
                  className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold px-3 py-1 rounded-xl transition-all active:scale-95 border border-emerald-200"
                >
                  {participants.length === members.length ? 'Bỏ chọn hết' : '✓ Chọn cả 4 người'}
                </button>
              </div>

              {/* Large Touchable Selection Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {members.map((m) => {
                  const isSelected = participants.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleParticipant(m.id)}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${m.avatarBg}`}
                        >
                          {m.avatarText}
                        </div>
                        <span className="text-sm font-bold">{m.name}</span>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-slate-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Calculation Preview & Exact Remainder Notice */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-2 text-slate-900 font-mono">
              <div className="flex items-center justify-between text-xs border-b border-emerald-500/20 pb-2">
                <span className="text-slate-600 font-sans font-semibold">Số người cùng chia:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                  {participants.length} thành viên
                </span>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-slate-700 font-sans font-bold">Mỗi người phải chịu:</span>
                <span className="font-black text-emerald-700 text-lg">
                  {formatVND(sharePerPersonBase)}
                  <span className="text-xs text-slate-500 font-sans font-normal ml-1">/người</span>
                </span>
              </div>

              {remainder > 0 && (
                <div className="text-[11px] text-emerald-800 font-sans pt-1 italic bg-emerald-100/60 p-2 rounded-xl">
                  * Số tiền lẻ dư ({remainder} ₫) được cân bằng tự động chính xác tuyệt đối vào tổng khoản chi.
                </div>
              )}
            </div>

            {/* Step 3 Actions */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>Quay lại</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{initialExpense ? 'Lưu chỉnh sửa' : 'Hoàn tất & Lưu khoản chi'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
