import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen relative overflow-hidden font-sans">
      {/* BACKGROUND STATIC MEDICAL (BROLL THEME) */}
      <div className="absolute inset-0 z-[-1] overflow-hidden bg-slate-50">
         {/* Static Blurred Medical Backdrop */}
         <div 
           className="absolute inset-0 bg-cover bg-center opacity-[0.08] blur-[1px] grayscale hover:grayscale-0 transition-all duration-1000"
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')" }}
         />
         
         {/* Mesh Gradients for Premium feel */}
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[100px]" />
         
         <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      </div>

      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <Header />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
            <div className="mx-auto max-w-[1600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
               {children}
            </div>
          </main>
          
          <footer className="py-5 px-8 text-center border-t border-slate-200/50 bg-white/40 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-1.5 font-sans">
               <p className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em]">
                 © 2026 Trung tâm Y tế khu vực Liên Chiểu - Hệ thống Quản lý Nhân lực Điều dưỡng
               </p>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors cursor-default">
                 Design by tritnq
               </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
