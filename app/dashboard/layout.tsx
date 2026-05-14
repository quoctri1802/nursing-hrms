import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/lib/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen relative overflow-hidden font-sans bg-[#F8FAFC]">
      
      {/* PREMIUM BACKGROUND LAYER */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
         {/* Base Background Gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/30" />
         
         {/* Subtle Medical Pattern */}
         <div className="absolute inset-0 opacity-[0.03] grayscale contrast-125 mix-blend-multiply" 
              style={{ backgroundImage: "radial-gradient(#2563eb 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
         
         {/* Dynamic Mesh Gradients */}
         <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px] animate-pulse" />
         <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-indigo-50/50 rounded-full blur-[120px] animate-pulse delay-700" />
         <div className="absolute top-[30%] left-[20%] w-[20%] h-[20%] bg-cyan-50/30 rounded-full blur-[80px]" />

         {/* Backdrop Content Blur Overlay */}
         <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <Header />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 no-scrollbar">
            <div className="mx-auto max-w-[1600px] animate-premium min-h-[calc(100vh-200px)]">
               {children}
            </div>
            
            <footer className="mt-20 py-12 px-8 text-center border-t border-slate-200/50">
              <div className="flex flex-col items-center gap-3">
                 <div className="flex items-center gap-4 text-slate-400">
                    <div className="h-px w-12 bg-slate-200" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                      Hospital Management Infrastructure
                    </p>
                    <div className="h-px w-12 bg-slate-200" />
                 </div>
                 <p className="text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] opacity-60">
                   © 2026 TRUNG TÂM Y TẾ KHU VỰC LIÊN CHIỂU - NURSING HRMS
                 </p>
                 <p className="text-[10px] font-bold text-blue-600/50 uppercase tracking-[0.4em] mt-1">
                   Author: Quốc Trí
                 </p>
              </div>
            </footer>
          </main>
        </div>
      </div>
      </div>
    </SidebarProvider>
  );
}
