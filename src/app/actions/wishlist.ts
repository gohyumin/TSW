"use server";

import { sql } from "@/lib/db";
import { getCurrentStudent } from "./auth";
import { revalidatePath } from "next/cache";

export async function getWishlistItems() {
  const student = await getCurrentStudent();
  if (!student) return [];

  try {
    const res = await sql`
      SELECT c.id, c.title, c.instructor, c.price, c.gradient_class as gradient, c.emoji, cat.category_name
      FROM student_wishlist w
      JOIN courses c ON w.course_id = c.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE w.student_id = ${student.id}
      ORDER BY w.created_at DESC
    `;

    return res.map((item) => ({
      id: item.id,
      title: item.title,
      instructor: item.instructor,
      price: Number(item.price),
      gradient: item.gradient,
      emoji: item.emoji,
      category: item.category_name
    }));
  } catch (error) {
    console.error("Failed to get wishlist items:", error);
    return [];
  }
}

export async function addToWishlist(courseId: number) {
  const student = await getCurrentStudent();
  if (!student) {
    return { success: false, error: "Please log in to add items to your wishlist." };
  }

  try {
    await sql`
      INSERT INTO student_wishlist (student_id, course_id)
      VALUES (${student.id}, ${courseId})
      ON CONFLICT (student_id, course_id) DO NOTHING
    `;

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    return { success: false, error: "Database error." };
  }
}

export async function removeFromWishlist(courseId: number) {
  const student = await getCurrentStudent();
  if (!student) {
    return { success: false, error: "User session expired." };
  }

  try {
    await sql`
      DELETE FROM student_wishlist
      WHERE student_id = ${student.id} AND course_id = ${courseId}
    `;

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    return { success: false, error: "Database error." };
  }
}
