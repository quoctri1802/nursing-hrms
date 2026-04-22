# Kế hoạch Public Hệ thống

Mục tiêu: Sửa lỗi Prisma và cấu hình ứng dụng để có thể dùng từ bên ngoài.

## Thay đổi dự kiến
1. **Sửa Schema**: Đổi provider sang `sqlite` để khớp với `.env`.
2. **Cập nhật Client**: Chạy `npx prisma generate`.
3. **Cấu hình Public**: Cập nhật `NEXTAUTH_URL` và chuẩn bị cho môi trường thực tế.

## Câu hỏi
- Bạn muốn dùng **Vercel** hay chạy trên **Máy chủ riêng**?
- Bạn có muốn dùng PostgreSQL online không?
