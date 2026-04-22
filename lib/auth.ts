import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-nursing-app-2026",
  debug: false,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        employeeCode: { label: "Mã nhân viên", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.employeeCode || !credentials?.password) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }

        try {
          console.log("Đang xác thực mã nhân viên:", credentials.employeeCode);
          
          const user = await prisma.user.findUnique({
            where: {
              employeeCode: credentials.employeeCode,
            },
            include: {
              department: true,
            },
          });

          if (!user || !user.password) {
            console.log("Không tìm thấy người dùng hoặc thiếu mật khẩu");
            throw new Error("Mã nhân viên hoặc mật khẩu không đúng");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Mật khẩu không chính xác");
            throw new Error("Mã nhân viên hoặc mật khẩu không đúng");
          }

          // CHẶN TRUY CẬP CHO ĐIỀU DƯỠNG THƯỜNG
          const allowedRoles = ["ADMIN", "HEAD_NURSE", "NURSE_DIRECTOR"];
          if (!allowedRoles.includes(user.role)) {
            console.log("Truy cập bị chặn - Vai trò:", user.role);
            throw new Error("Tài khoản của bạn không có quyền truy cập hệ thống này");
          }

          console.log("Xác thực thành công cho:", user.name);
          
          return {
            id: user.id,
            employeeCode: user.employeeCode,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId,
            departmentName: user.department?.name,
          };
        } catch (error: any) {
          console.error("Lỗi xác thực:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.departmentId = (user as any).departmentId;
        token.departmentName = (user as any).departmentName;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).departmentId = token.departmentId;
        (session.user as any).departmentName = token.departmentName;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
