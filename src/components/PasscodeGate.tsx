import React, { useState } from 'react';
import { KeyRound, Lock, ArrowRight, ShieldAlert, Sparkles, Home } from 'lucide-react';

interface PasscodeGateProps {
  onAuthenticate: () => void;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim().toUpperCase();
    if (cleanCode === 'P215') {
      localStorage.setItem('room_passcode_authenticated', 'true');
      onAuthenticate();
    } else {
      setError(true);
      setErrorMessage('Mã phòng không chính xác. Vui lòng kiểm tra và thử lại!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Passcode Verification Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Top Header Badge & Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Home className="w-8 h-8 stroke-[2.2]" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-slate-900 shadow-sm">
              <Lock className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Xác Thực Bảo Mật • Cloud Sync</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight pt-1">
              Quản Lý Chia Tiền Phòng
            </h1>
            <p className="text-xs text-slate-400 max-w-xs">
              Vui lòng nhập <span className="text-emerald-400 font-semibold">Mã phòng</span> để truy cập bảng tính toán công nợ.
            </p>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Mã Truy Cập Phòng
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Nhập mã truy cập..."
                autoFocus
                className={`w-full bg-slate-950 border ${
                  error
                    ? 'border-rose-500 focus:border-rose-500 text-rose-200'
                    : 'border-slate-800 focus:border-emerald-500 text-white'
                } rounded-2xl pl-11 pr-4 py-3 text-sm font-mono tracking-wider outline-none transition-all placeholder:text-slate-600 placeholder:font-sans uppercase`}
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Vào Hệ Thống</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
          Hệ thống chia tiền tự động & đồng bộ thời gian thực
        </div>
      </div>
    </div>
  );
};
