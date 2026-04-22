"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ChevronRight,
  Home,
  ShieldCheck,
  Briefcase,
  ClipboardList,
  Heart,
  Menu
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";

export function Header() {
  const { toggle } = useSidebar();
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
      case "ADMIN": return "Quản trị";
      case "HEAD_NURSE": return "ĐD Trưởng";
      case "NURSE_DIRECTOR": return "Trưởng phòng";
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
    <header className="h-20 bg-white/40 backdrop-blur-2xl border-b border-white/40 px-4 md:px-10 flex items-center justify-between sticky top-0 z-30 font-sans">
      <div className="flex items-center gap-6 flex-1">
        {/* Mobile menu button */}
        <button 
          onClick={toggle}
          className="md:hidden p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          <Menu className="h-6 w-6 text-slate-600" />
        </button>

        {/* Breadcrumbs - Refined for desktop */}
        <nav className="hidden lg:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link href="/dashboard" className="p-2.5 bg-white/80 rounded-2xl hover:text-blue-600 hover:scale-110 transition-all shadow-sm border border-white/60">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.href} className="flex items-center gap-3">
              <ChevronRight className="h-3 w-3 opacity-30" />
              <Link
                href={crumb.href}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all duration-300",
                  idx === breadcrumbs.length - 1 
                    ? "text-slate-900 bg-white shadow-sm border border-slate-100 font-extrabold" 
                    : "hover:text-slate-900 hover:bg-white/50"
                )}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-8">
        {/* Modern Search Bar */}
        <div className="hidden sm:flex items-center bg-white/40 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl px-5 py-2.5 w-full max-w-[240px] focus-within:max-w-[300px] focus-within:bg-white focus-within:shadow-xl transition-all duration-500 group">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600" />
          <input
            type="text"
            placeholder="TÌM KIẾM..."
            className="bg-transparent border-none focus:ring-0 text-[10px] font-black w-full px-3 placeholder:text-slate-300 uppercase tracking-widest text-slate-700"
          />
        </div>

        <button className="relative p-3 text-slate-500 hover:text-blue-600 hover:bg-white rounded-2xl transition-all active:scale-90 group shadow-sm border border-transparent hover:border-blue-100">
          <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </button>

        {/* User Profile Card */}
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl px-4 py-2 rounded-3xl border border-white shadow-sm hover:shadow-2xl hover:bg-white transition-all duration-500 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-slate-900 leading-none mb-1.5 uppercase tracking-tighter">{cleanName}</p>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/50 rounded-lg border border-slate-100">
                <p className={cn("text-[9px] font-black uppercase tracking-widest", roleStyles.split(' ')[0])}>
                  {getRoleLabel(userRole)}
                </p>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg transition-all duration-500 group-hover:scale-110 ring-2 ring-white/50",
            roleStyles.split(' ').slice(1).join(' ')
          )}>
            {cleanName.split(" ").pop()?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
