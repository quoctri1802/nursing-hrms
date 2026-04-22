"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  togglePinAnnouncement 
} from "@/app/actions/announcements";
import { 
  Megaphone, 
  Pin, 
  Calendar, 
  User, 
  Send,
  Plus,
  X,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Utility: Tối ưu kích thước hình ảnh (Canvas resize)
 */
async function optimizeImage(base64Str: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7)); // Giảm chất lượng xuống 0.7 để tối ưu dung lượng
    };
  });
}

/**
 * Component Hiển thị Modal chi tiết thông báo
 */
function AnnouncementModal({ announcement, onClose }: { announcement: any, onClose: () => void }) {
  if (!announcement) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl shadow-blue-200">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight pr-10 tracking-tighter capitalize">
                {announcement.title}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {announcement.author?.name || "Bệnh viện"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(announcement.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
          {announcement.imageUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50">
               <Image 
                src={announcement.imageUrl} 
                alt={announcement.title} 
                fill 
                className="object-cover"
                unoptimized // Do là base64 nên không cần Next optimize lần nữa
               />
            </div>
          )}
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base font-medium">
            {announcement.content}
          </p>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Đã tiếp nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Fetch announcements error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Xử lý nạp ảnh và tối ưu
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Hình ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const optimized = await optimizeImage(base64);
      setImageUrl(optimized);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    
    const payload = {
      title,
      content,
      imageUrl,
      isPinned: false, // Mặc định không ghim khi tạo mới
      authorId: (session?.user as any)?.id,
    };

    let res;
    if (editId) {
      res = await updateAnnouncement(editId, payload);
    } else {
      res = await createAnnouncement(payload);
    }

    if (res.success) {
      resetForm();
      fetchAnnouncements();
    }
    setIsSubmitLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageUrl(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (ann: any) => {
    setTitle(ann.title);
    setContent(ann.content);
    setImageUrl(ann.imageUrl);
    setEditId(ann.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      await deleteAnnouncement(id);
      fetchAnnouncements();
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    await togglePinAnnouncement(id, !currentPin);
    fetchAnnouncements();
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "NURSE_DIRECTOR";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Bản tin bệnh viện</h1>
          <p className="text-slate-500 text-sm font-medium mt-2 italic">Nơi cập nhật thông tin vận hành và nhân sự quan trọng nhanh nhất.</p>
        </div>
        {(session?.user as any)?.role !== "NURSE" && (
          <button 
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Hủy đăng tin" : editId ? "Tiếp tục sửa" : "Tạo bản tin mới"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[32px] border-2 border-blue-50 shadow-2xl animate-in slide-in-from-top-6 duration-500">
          <div className="space-y-8">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề bản tin</label>
               <input 
                type="text" 
                placeholder="Nhập tiêu đề thu hút sự chú ý..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-black border-none focus:ring-0 placeholder:text-slate-200 p-0 text-slate-800"
                required
              />
            </div>
            
            <div className="h-px bg-slate-100" />
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hình ảnh đính kèm (Tính năng mới)</label>
               <div className="flex flex-col sm:flex-row gap-6">
                  {imageUrl ? (
                    <div className="relative w-full sm:w-64 aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                       <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                       <button 
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <X className="h-4 w-4" />
                       </button>
                    </div>
                  ) : (
                    <label className="w-full sm:w-64 aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all text-slate-400">
                       <ImageIcon className="h-8 w-8 opacity-20" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Tải ảnh lên</span>
                       <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageChange}
                       />
                    </label>
                  )}
                  <div className="flex-1 text-xs text-slate-400 font-medium italic space-y-2 py-2">
                     <p>• Hình ảnh sẽ được hệ thống tối ưu hóa dung lượng trước khi lưu.</p>
                     <p>• Hỗ trợ các định dạng: JPG, PNG, WEBP.</p>
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung chi tiết</label>
              <textarea 
                placeholder="Truyền đạt các chỉ thị hoặc thông tin tại đây..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[150px] border-none focus:ring-0 text-slate-600 text-base font-medium resize-none p-0 custom-scrollbar"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Hủy
              </button>
              <button 
                type="submit"
                disabled={isSubmitLoading}
                className="flex items-center gap-2 px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
              >
                {isSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {editId ? "Cập nhật bản tin" : "Phát hành bản tin"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-8 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
             <div className="h-12 w-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải bản tin...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
             <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Megaphone className="h-10 w-10 text-slate-300" />
             </div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Hiện tại chưa có bản tin nào được phát hành</p>
          </div>
        ) : announcements.map((item) => (
          <div key={item.id} className={cn(
            "bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all group overflow-hidden relative",
            item.isPinned && "border-blue-200 ring-4 ring-blue-50/50 shadow-blue-50"
          )}>
            {/* THẺ GHIM */}
            {item.isPinned && (
              <div className="absolute top-0 right-0 p-6 z-10">
                <div className="flex items-center gap-2 text-white bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  <Pin className="h-3.5 w-3.5" />
                  Ghim tiêu điểm
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row">
               {item.imageUrl && (
                 <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden bg-slate-100">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                 </div>
               )}
               
               <div className="flex-1 p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-500",
                        item.isPinned ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"
                      )}>
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-tight group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    
                    <p className="text-slate-500 leading-relaxed line-clamp-2 mb-8 text-base font-medium">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-4 flex-wrap">
                    <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {item.author?.name || "Bệnh viện"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                       {isAdmin && (
                         <>
                            <button 
                              onClick={() => handleTogglePin(item.id, item.isPinned)}
                              className={cn(
                                "p-2.5 rounded-xl border border-slate-100 transition-all hover:shadow-lg",
                                item.isPinned ? "text-red-600 bg-red-50 hover:bg-white" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              )}
                              title={item.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                            >
                               <Pin className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-xl transition-all hover:shadow-lg"
                              title="Sửa bản tin"
                            >
                               <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-100 rounded-xl transition-all hover:shadow-lg"
                              title="Xóa bản tin"
                            >
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </>
                       )}
                       <button 
                        onClick={() => setSelectedAnnouncement(item)}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                      >
                        Đọc toàn bộ
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <AnnouncementModal 
        announcement={selectedAnnouncement} 
        onClose={() => setSelectedAnnouncement(null)} 
      />
    </div>
  );
}
