"use server";

import { sql } from "@/lib/db";

export interface CategoryData {
  id: number;
  category_name: string;
  emoji: string;
  gradient_class: string;
  color_class: string;
  description: string;
}

export interface SubcategoryData {
  id: number;
  name: string;
  parent_category_id: number;
}

/**
 * Fetches all categories with their display metadata from the database.
 */
export async function getCategories(): Promise<CategoryData[]> {
  try {
    const res = await sql`
      SELECT id, category_name, emoji, gradient_class, color_class, description
      FROM categories
      ORDER BY id ASC
    `;
    return res.map(row => ({
      id: Number(row.id),
      category_name: String(row.category_name),
      emoji: String(row.emoji || "📚"),
      gradient_class: String(row.gradient_class || ""),
      color_class: String(row.color_class || "text-indigo-500"),
      description: String(row.description || "")
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

/**
 * Fetches all subcategories grouped by parent category from the database.
 * Returns a Record mapping category_name -> subcategory names[].
 */
export async function getSubcategoriesByParent(): Promise<Record<string, string[]>> {
  try {
    const res = await sql`
      SELECT s.name as sub_name, c.category_name
      FROM subcategories s
      JOIN categories c ON s.parent_category_id = c.id
      ORDER BY c.id ASC, s.name ASC
    `;
    const grouped: Record<string, string[]> = {};
    res.forEach(row => {
      const catName = String(row.category_name);
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(String(row.sub_name));
    });
    return grouped;
  } catch (error) {
    console.error("Failed to fetch subcategories by parent:", error);
    return {};
  }
}
