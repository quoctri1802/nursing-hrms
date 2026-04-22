"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Calendar, 
  Bell, 
  Settings, 
  Building2,
  LogOut,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  Briefcase,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

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
  const userRole = (session?.user as any)?.role || "NURSE";

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
    <aside className="hidden md:flex flex-col w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/50 shadow-sm relative z-20 font-sans">
      <div className="p-6">
        <div className="flex flex-col items-center gap-2 mb-8 text-center text-slate-800">
          <div className="relative h-20 w-20 mb-2">
            <Image
              src="/logo.png"
              alt="Logo TTYT Liên Chiểu"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold uppercase leading-tight">
              TTYT Liên Chiểu
            </span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest opacity-80">
              NURSE HRMS
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all",
                  isActive 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.title}
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-100/50">
        <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm mb-3 group hover:bg-white hover:shadow-md transition-all duration-300">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg transition-transform group-hover:scale-105 ring-2 ring-white",
            roleStyles.split(' ').slice(1).join(' ')
          )}>
            {cleanName.split(" ").pop()?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate leading-none mb-1 uppercase tracking-tight">
              {cleanName}
            </p>
            <div className="flex items-center gap-1.5 leading-none">
              {userRole === "ADMIN" && <ShieldCheck className="h-2.5 w-2.5 text-purple-600" />}
              {userRole === "NURSE_DIRECTOR" && <Briefcase className="h-2.5 w-2.5 text-indigo-600" />}
              {userRole === "HEAD_NURSE" && <ClipboardList className="h-2.5 w-2.5 text-blue-600" />}
              {userRole === "NURSE" && <Heart className="h-2.5 w-2.5 text-emerald-600" />}
              <p className={cn("text-[10px] font-black uppercase tracking-widest truncate", roleStyles.split(' ')[0])}>
                {getRoleLabel(userRole)}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98] group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
