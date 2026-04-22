"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: true,
      },
      orderBy: [
        { isPinned: "desc" }, // Ghim lên đầu
        { createdAt: "desc" }
      ],
    });
    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function createAnnouncement(data: any) {
  try {
    const announcement = await prisma.announcement.create({
      data,
    });
    revalidatePath("/dashboard/announcements");
    revalidatePath("/dashboard");
    return { success: true, announcement };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false };
  }
}

export async function updateAnnouncement(id: string, data: any) {
  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/announcements");
    return { success: true, announcement };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { success: false };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({
      where: { id },
    });
    revalidatePath("/dashboard/announcements");
    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false };
  }
}

export async function togglePinAnnouncement(id: string, isPinned: boolean) {
  try {
    await prisma.announcement.update({
      where: { id },
      data: { isPinned },
    });
    revalidatePath("/dashboard/announcements");
    return { success: true };
  } catch (error) {
    console.error("Error pinning announcement:", error);
    return { success: false };
  }
}
