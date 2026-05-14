"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LogIn,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  MapPin,
  Heart,
  ChevronRight,
  Briefcase,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    if (!employeeCode || !password) {
      setError("Vui lòng nhập mã định danh.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        employeeCode,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      if (res?.error) {
        setError("Mã định danh hoặc mật khẩu chưa chính xác.");
      } else if (res?.ok) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Kết nối máy chủ bị gián đoạn.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white bg-[#0f172a]">

      {/* BACKGROUND ELEMENTS */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-ken-burns opacity-30"
        style={{ backgroundImage: "url('/login-bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/90 to-blue-900/30" />

      {/* AMBIENT GLOWS */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* MAIN LAYOUT CONTAINER */}
      <div className="relative z-20 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 min-h-[680px] m-4 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-premium">

        {/* BRANDING PANEL (Left - 5 Cols) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-16 relative overflow-hidden bg-slate-950/40 border-r border-white/5">
          {/* Subtle Heartbeat Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
            <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 300H150L180 200L220 450L260 250L290 350L320 300H800" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 space-y-12">
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg group hover:bg-white/20 transition-all">
              <div className="p-2 bg-white rounded-xl shadow-inner group-hover:rotate-12 transition-transform">
                <Image src="/logo.png" alt="Logo" width={44} height={44} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-[0.1em] text-white uppercase leading-none">Nursing</span>
                <span className="text-[14px] font-semibold text-blue-400 uppercase tracking-widest mt-1.5">Management System</span>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="flex items-center gap-5 text-white tracking-tight">
                  <span className="text-base font-semibold text-blue-300/60 uppercase tracking-[0.3em] whitespace-nowrap">Chăm sóc bằng</span>
                  <span className="text-6xl font-black text-white drop-shadow-2xl">TÂM</span>
                </h2>
                <h2 className="flex items-center gap-5 text-white tracking-tight">
                  <span className="text-base font-semibold text-blue-300/60 uppercase tracking-[0.3em] whitespace-nowrap">Quản lý bằng</span>
                  <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-300 drop-shadow-2xl">TẦM</span>
                </h2>
              </div>
              
              <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-transparent rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
              
              <p className="text-slate-300 text-lg leading-relaxed max-w-xs font-medium italic opacity-90 border-l-2 border-blue-500/30 pl-6">
                Hệ thống quản trị nguồn nhân lực điều dưỡng hiện đại và chuyên nghiệp.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-4">
            {["Precision", "Efficiency", "Safety"].map((text) => (
              <div key={text} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* LOGIN FORM PANEL (Right - 7 Cols) */}
        <div className="lg:col-span-7 bg-white p-12 md:p-20 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full space-y-12">

            <div className="space-y-3 text-center lg:text-left">
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">Chào bạn !</h3>
              <p className="text-slate-500 font-medium text-lg italic">Vui lòng đăng nhập để tiếp tục quản lý.</p>
              <div className="h-1.5 w-16 bg-blue-600 rounded-full mx-auto lg:mx-0 mt-4 shadow-lg shadow-blue-500/20" />
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="group relative">
                  <label className="absolute left-0 -top-7 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] group-focus-within:text-blue-600 transition-colors">
                    Mã nhân viên
                  </label>
                  <div className="flex items-center border-b-2 border-slate-100 group-focus-within:border-blue-600 transition-all py-3 gap-4">
                    <User className="text-slate-300 group-focus-within:text-blue-600 transition-colors" size={24} />
                    <input
                      type="text"
                      autoFocus
                      className="w-full bg-transparent outline-none text-xl font-bold text-slate-800 placeholder:text-slate-200 placeholder:font-normal"
                      placeholder="VD: NV001"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group relative pt-6">
                  <label className="absolute left-0 top-[-2px] text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] group-focus-within:text-blue-600 transition-colors">
                    Mật khẩu
                  </label>
                  <div className="flex items-center border-b-2 border-slate-100 group-focus-within:border-blue-600 transition-all py-3 gap-4">
                    <Lock className="text-slate-300 group-focus-within:text-blue-600 transition-colors" size={24} />
                    <input
                      type="password"
                      className="w-full bg-transparent outline-none text-xl font-bold text-slate-800 placeholder:text-slate-200 placeholder:font-normal tracking-widest"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-3 border border-red-100">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-16 bg-[#0f172a] hover:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.3em]">Truy cập hệ thống</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-40">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <MapPin size={14} />
                525 Tôn Đức Thắng, Đà Nẵng, Việt Nam
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Design by Quốc Trí
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ken-burns {
          0% { transform: scale(1.1); }
          100% { transform: scale(1.2); }
        }
        .animate-ken-burns {
          animation: ken-burns 60s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}
