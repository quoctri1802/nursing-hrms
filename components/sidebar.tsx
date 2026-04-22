"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Calendar, 
  Bell, 
  Building2,
  LogOut,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  Briefcase,
  Heart,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/lib/sidebar-context";

const menuItems = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "HEAD_NURSE", "NURSE", "NURSE_DIRECTOR"]
  },
  {
    title: "Nhân viên",
    href: "/dashboard/staff",
    icon: Users,
    roles: ["ADMIN", "HEAD_NURSE", "NURSE_DIRECTOR"]
  },
  {
    title: "Khoa phòng",
    href: "/dashboard/departments",
    icon: Building2,
    roles: ["ADMIN", "NURSE_DIRECTOR"]
  },
  {
    title: "Báo cáo ngày",
    href: "/dashboard/reports",
    icon: ClipboardList,
    roles: ["ADMIN", "HEAD_NURSE", "NURSE", "NURSE_DIRECTOR"]
  },
  {
    title: "Lịch trực",
    href: "/dashboard/schedule",
    icon: Calendar,
    roles: ["ADMIN", "HEAD_NURSE", "NURSE", "NURSE_DIRECTOR"]
  },
  {
    title: "Thông báo",
    href: "/dashboard/announcements",
    icon: Bell,
    roles: ["ADMIN", "HEAD_NURSE", "NURSE", "NURSE_DIRECTOR"]
  },
  {
    title: "Hướng dẫn",
    href: "/dashboard/guide",
    icon: BookOpen,
    roles: ["ADMIN", "HEAD_NURSE", "NURSE", "NURSE_DIRECTOR"]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, setIsOpen } = useSidebar();
  const userRole = (session?.user as any)?.role || "NURSE";

  // Đóng sidebar khi chuyển trang trên mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

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
      default: return "text-emerald-600 bg-emerald-50 ring-emerald-100";
    }
  };

  const userName = session?.user?.name || "Người dùng";
  const cleanName = userName.split("#")[0].trim();
  const roleStyles = getRoleStyles(userRole);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-2xl border-r border-white/40 shadow-2xl transition-transform duration-500 ease-out md:relative md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6 pt-10 md:pt-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-2 mb-10 text-center animate-premium">
            <div className="relative h-20 w-20 mb-2 drop-shadow-2xl">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none">
                Trung tâm Y tế <br /> Khu vực Liên Chiểu
              </span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
                Nursing HRMS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-1">
            {filteredMenu.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 animate-premium",
                    isActive 
                      ? "bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]" 
                      : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                    )} />
                    <span className={cn("font-bold tracking-tight", isActive ? "font-extrabold" : "font-semibold")}>
                      {item.title}
                    </span>
                  </div>
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-glow" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="mt-6 pt-6 border-t border-slate-100/50">
            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm mb-4 group hover:bg-white hover:shadow-xl transition-all duration-500">
              <div className={cn(
                "h-11 w-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner transition-transform group-hover:scale-105",
                roleStyles.split(' ').slice(1).join(' ')
              )}>
                {cleanName.split(" ").pop()?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate tracking-tight mb-0.5">
                  {cleanName}
                </p>
                <div className="flex items-center gap-1.5 leading-none">
                  <p className={cn("text-[9px] font-black uppercase tracking-widest truncate", roleStyles.split(' ')[0])}>
                    {getRoleLabel(userRole)}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-4 w-full px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98] group"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
