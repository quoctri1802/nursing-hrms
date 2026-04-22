# Kế hoạch Triển khai Vercel & PostgreSQL Online

Mục tiêu chính là đưa ứng dụng lên Vercel và kết nối với một cơ sở dữ liệu PostgreSQL trực tuyến (như Supabase hoặc Neon).

## Các bước thực hiện

### 1. Chuẩn bị Cơ sở dữ liệu Online
- Đăng ký **Supabase** hoặc **Neon.tech**.
- Lấy chuỗi `DATABASE_URL` (dạng `postgresql://...`).

### 2. Cấu hình Code
- **.env**: Cập nhật `DATABASE_URL` mới và `NEXTAUTH_URL` theo tên miền Vercel.
- **schema.prisma**: Giữ nguyên `provider = "postgresql"`.

### 3. Quy trình Triển khai
- Đẩy code lên GitHub.
- Import vào Vercel.
- Cấu hình Environment Variables trên dashboard Vercel.

## Lưu ý về Dữ liệu
Dữ liệu trong file `dev.db` hiện tại sẽ không tự động chuyển sang database online. Bạn sẽ cần nhập lại dữ liệu hoặc dùng script chuyển đổi.

---
**Vui lòng xác nhận nếu bạn đồng ý với kế hoạch này để tôi bắt đầu thực hiện các thay đổi trong code.**
