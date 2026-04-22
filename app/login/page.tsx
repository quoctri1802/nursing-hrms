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
      setError("Vui lòng nhập định danh nhân viên.");
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
      setError("Kết nối gián đoạn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 bg-slate-950">
      
      {/* FULL-SCREEN BACKGROUND */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-ken-burns scale-110"
        style={{ backgroundImage: "url('/login-bg.png')" }}
      />
      
      {/* OVERLAYS FOR DEPTH */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-slate-950/90" />

      {/* CENTERED LOGIN CONTAINER */}
      <div className="relative z-20 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 glass-card rounded-[48px] border-white/20 shadow-2xl overflow-hidden animate-premium m-4">
        
        {/* INFO SECTION (Left side) */}
        <div className="hidden lg:flex flex-col justify-between p-20 border-r border-white/10">
          <div className="flex items-center gap-5">
            <div className="bg-white p-3 rounded-3xl shadow-2xl rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              <Image src="/logo.png" alt="Logo" width={70} height={70} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter uppercase leading-tight text-white">
                TRUNG TÂM Y TẾ <br /> KHU VỰC LIÊN CHIỂU
              </span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1">
                Nursing HRMS System
              </span>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center gap-3 text-blue-400/60">
              <div className="h-px w-16 bg-blue-400/30" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Hospital Authority</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter leading-[1.1] text-white">
              Chăm sóc bằng <span className="text-blue-500">Tâm</span> <br />
              Quản lý bằng <span className="text-blue-500">Tầm</span>
            </h2>
            <p className="max-w-sm text-slate-300 font-medium leading-relaxed italic border-l-4 border-blue-500/50 pl-8 py-2 text-lg opacity-80">
              Hệ thống quản trị nguồn nhân lực điều dưỡng hiện đại, tối ưu hóa quy trình vận hành bệnh viện 4.0.
            </p>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-white/30">
            <span>Efficiency</span>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span>Precision</span>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span>Safety</span>
          </div>
        </div>

        {/* FORM SECTION (Right side) */}
        <div className="p-10 md:p-20 flex flex-col justify-center bg-white/90 backdrop-blur-3xl relative">
          {/* MOBILE LOGO */}
          <div className="lg:hidden mb-12 flex flex-col items-center gap-5">
            <div className="bg-white p-4 rounded-[32px] shadow-2xl border border-slate-100">
              <Image src="/logo.png" alt="Logo" width={60} height={60} />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                TRUNG TÂM Y TẾ <br /> KHU VỰC LIÊN CHIỂU
              </h1>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2 block">Nurse HRMS</span>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Chào bạn !</h3>
              <p className="text-slate-400 text-sm font-semibold italic">Vui lòng đăng nhập để tiếp tục quản lý.</p>
              <div className="h-2 w-16 bg-blue-600 rounded-full" />
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Mã nhân viên</label>
                <div className="relative group">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-blue-600 transition-all duration-500" strokeWidth={2.5} />
                  <input
                    type="text"
                    autoFocus
                    className="w-full h-16 bg-transparent border-b-2 border-slate-100 pl-10 focus:border-blue-600 focus:outline-none transition-all font-black text-xl text-slate-800 placeholder:text-slate-200 placeholder:italic"
                    placeholder="Nhập mã định danh..."
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Mật khẩu</label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-blue-600 transition-all duration-500" strokeWidth={2.5} />
                  <input
                    type="password"
                    className="w-full h-16 bg-transparent border-b-2 border-slate-100 pl-10 focus:border-blue-600 focus:outline-none transition-all font-black text-xl text-slate-800 placeholder:text-slate-200 placeholder:italic"
                    placeholder="Nhập mã bảo mật..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-3xl text-[12px] font-black animate-in zoom-in-95 duration-300 flex items-center gap-4 border border-red-100">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-20 bg-slate-900 group text-white rounded-[32px] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-6"
              >
                {loading ? (
                  <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Truy cập hệ thống
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                <MapPin className="h-4 w-4 text-blue-500" />
                Liên Chiểu, Đà Nẵng
              </div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest opacity-30">
                Design by Quốc Trí
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ken-burns {
          0% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-ken-burns {
          animation: ken-burns 40s ease-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
