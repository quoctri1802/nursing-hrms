"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
  Home,
  ShieldCheck,
  Briefcase,
  ClipboardList,
  Heart
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userName = session?.user?.name || "Người dùng";
  const userRole = (session?.user as any)?.role || "NURSE";

  // Breadcrumbs logic
  const pathSegments = pathname.split("/").filter(segment => segment !== "");
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = segment === "dashboard" ? "Trang chủ"
      : segment === "staff" ? "Nhân viên"
        : segment === "departments" ? "Khoa phòng"
          : segment === "reports" ? "Báo cáo"
            : segment === "schedule" ? "Lịch trực"
              : segment === "announcements" ? "Thông báo"
                : segment;
    return { href, label };
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN": return "Quản trị viên";
      case "HEAD_NURSE": return "Điều dưỡng trưởng";
      case "NURSE_DIRECTOR": return "Trưởng phòng điều dưỡng";
      default: return "Điều dưỡng";
    }
  };

  const getRoleStyles = (role: string) => {
    switch (role) {
      case "ADMIN": return "text-purple-600 bg-purple-50 ring-purple-600";
      case "NURSE_DIRECTOR": return "text-indigo-600 bg-indigo-50 ring-indigo-600";
      case "HEAD_NURSE": return "text-blue-600 bg-blue-50 ring-blue-600";
      default: return "text-emerald-600 bg-emerald-50 ring-emerald-600";
    }
  };

  const cleanName = userName.split("#")[0].trim();
  const roleStyles = getRoleStyles(userRole);

  return (
    <header className="h-20 bg-white/60 backdrop-blur-[20px] border-b border-white/40 px-4 md:px-10 flex items-center justify-between sticky top-0 z-50 transition-all font-sans shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <button className="lg:hidden p-2.5 text-slate-500 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-95">
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo in Header - Especially for mobile */}
        <Link href="/dashboard" className="flex items-center gap-3 group transition-all duration-300">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            <Image
              src="/logo.png"
              alt="Logo TTYT Liên Chiểu"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden xsm:flex flex-col">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-0.5">TTYT Liên Chiểu</span>
            <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest opacity-70">NURSE HRMS</span>
          </div>
        </Link>

        {/* Breadcrumbs - Hidden on mobile, refined on desktop */}
        <nav className="hidden lg:flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
          <Link href="/dashboard" className="p-2 bg-white/50 rounded-xl hover:text-blue-600 hover:bg-white transition-all shadow-sm">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.href} className="flex items-center gap-2.5">
              <ChevronRight className="h-3 w-3 opacity-20" />
              <Link
                href={crumb.href}
                className={cn(
                  "hover:text-slate-900 transition-all",
                  idx === breadcrumbs.length - 1 ? "text-slate-900 bg-white/30 px-3 py-1.5 rounded-lg border border-white/50" : ""
                )}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Modern Search Bar - Glassmorphism style */}
        <div className="hidden sm:flex items-center bg-slate-900/5 backdrop-blur-md border border-white/10 shadow-inner rounded-2xl px-4 py-2.5 w-full max-w-[280px] group focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white focus-within:max-w-[320px] transition-all duration-500">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full px-3 placeholder:text-slate-400 uppercase tracking-tight text-slate-700"
          />
        </div>

        {/* Mobile Search Icon */}
        <button className="sm:hidden p-2.5 text-slate-500 hover:bg-white rounded-xl transition-all active:scale-95">
          <Search className="h-5 w-5" />
        </button>

        <button className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white hover:shadow-lg rounded-xl transition-all active:scale-95 group">
          <Bell className="h-5 w-5 group-hover:shake transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        </button>

        {/* User Profile - Premium Glass Card */}
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl px-3 py-1.5 rounded-[22px] border border-white/50 shadow-sm hover:shadow-xl hover:bg-white hover:border-blue-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/[0.02] to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <div className="text-right hidden sm:block relative z-10">
            <p className="text-sm font-black text-slate-900 leading-none mb-1.5 uppercase tracking-tighter">{cleanName}</p>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/50 rounded-lg border border-white/80 shadow-inner">
                {userRole === "ADMIN" && <ShieldCheck className="5-3 w-5 text-purple-600" />}
                {userRole === "NURSE_DIRECTOR" && <Briefcase className="h-5 w-5 text-indigo-600" />}
                {userRole === "HEAD_NURSE" && <ClipboardList className="h-5 w-5 text-blue-600" />}
                {userRole === "NURSE" && <Heart className="h-5 w-5 text-emerald-600" />}
                <p className={cn("text-[9px] font-black uppercase tracking-[0.15em]", roleStyles.split(' ')[0])}>
                  {getRoleLabel(userRole)}
                </p>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ring-4 ring-white/30",
            roleStyles.split(' ').slice(1).join(' ')
          )}>
            {cleanName.split(" ").pop()?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
