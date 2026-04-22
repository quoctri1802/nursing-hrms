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
  Stethoscope,
  Briefcase,
  ClipboardList,
  GraduationCap
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
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-all duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-slate-950/80" />

      {/* CENTERED LOGIN CONTAINER */}
      <div className="relative z-20 w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-2xl rounded-[48px] border border-white/20 shadow-[0_32px_120px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up m-4">
        
        {/* INFO SECTION (Left side of the card) */}
        <div className="hidden lg:flex flex-col justify-between p-16 border-r border-white/10 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-2xl shadow-2xl">
              <Image src="/logo.png" alt="Logo" width={60} height={60} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter uppercase leading-tight italic text-white">
                Lien Chieu Regional Medical Center
              </span>
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.3em]">
                Nurse HRMS Project
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 text-blue-300">
              <div className="h-px w-12 bg-blue-400/50" />
              <span className="text-xs font-black uppercase tracking-widest italic">Hospital Authority</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-[1.2] text-white">
              Chăm sóc bằng <span className="text-red-400">Tâm</span> <br />
              Quản lý bằng <span className="text-red-400">Tầm</span>
            </h2>
            <p className="max-w-md text-slate-200 font-medium leading-relaxed italic border-l-4 border-blue-400/50 pl-6 py-2 text-base">
              Hệ thống quản trị nguồn nhân lực điều dưỡng hiện đại, tối ưu hóa quy trình vận hành bệnh viện 4.0.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
            <span>Efficiency</span>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
            <span>Precision</span>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
            <span>Safety</span>
          </div>
        </div>

        {/* FORM SECTION (Right side of the card) */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white/80 backdrop-blur-xl">
          {/* MOBILE LOGO (Visible only on mobile/tablet) */}
          <div className="lg:hidden mb-10 flex flex-col items-center gap-4">
            <div className="bg-white p-3 rounded-[24px] shadow-xl border border-slate-100">
              <Image src="/logo.png" alt="Logo" width={60} height={60} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">
                Lien Chieu Regional <br /> Medical Center
              </h1>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mt-1 block">Nurse HRMS</span>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter capitalize leading-none">Chào mừng bạn trở lại </h3>
              <p className="text-slate-500 text-sm font-medium italic">Hệ thống quản lý nguồn lực trung tâm.</p>
              <div className="h-1.5 w-12 bg-blue-600 rounded-full" />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Mã nhân viên</label>
                <div className="relative group">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" strokeWidth={2.5} />
                  <input
                    type="text"
                    autoFocus
                    className="w-full h-14 bg-transparent border-b-2 border-slate-100 pl-8 focus:border-blue-600 focus:outline-none transition-all font-bold text-slate-800 placeholder:text-slate-200 placeholder:italic"
                    placeholder="Nhập mã định danh..."
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Mật khẩu</label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" strokeWidth={2.5} />
                  <input
                    type="password"
                    className="w-full h-14 bg-transparent border-b-2 border-slate-100 pl-8 focus:border-blue-600 focus:outline-none transition-all font-bold text-slate-800 placeholder:text-slate-200 placeholder:italic"
                    placeholder="Nhập mã bảo mật..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-[11px] font-black animate-in fade-in duration-300 flex items-center gap-3 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-16 bg-slate-900 group text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(0,0,0,0.15)] hover:bg-blue-600 hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Truy cập tài khoản
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="pt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Admin", icon: ShieldCheck, color: "text-blue-500" },
                  { label: "Trưởng khoa", icon: ClipboardList, color: "text-orange-500" },
                  { label: "Lãnh đạo", icon: Briefcase, color: "text-indigo-500" },
                  { label: "Điều dưỡng", icon: Heart, color: "text-red-500" },
                ].map((role, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-3 group/role hover:shadow-lg transition-all cursor-default">
                     <role.icon className={cn("h-4 w-4 shrink-0", role.color)} />
                     <span className="text-[9px] font-black text-slate-800 uppercase tracking-tighter">{role.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                525 Tôn Đức Thắng, TP. Đà Nẵng
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                ©  2026 by tritnq
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ken-burns {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-ken-burns {
          animation: ken-burns 30s ease-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
