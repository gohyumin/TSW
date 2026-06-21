"use server";

import { sql } from "@/lib/db";

export interface Subcategory {
  id: number;
  name: string;
  parent_category_id: number;
  description: string;
}

export interface SubcategoryRelation {
  id: number;
  subject_id: number;
  predicate: string;
  object_id: number;
}

export async function getSubcategories(): Promise<Subcategory[]> {
  try {
    const res = await sql`
      SELECT id, name, parent_category_id, description
      FROM subcategories
      ORDER BY name ASC
    `;
    return res.map(row => ({
      id: Number(row.id),
      name: String(row.name),
      parent_category_id: Number(row.parent_category_id),
      description: String(row.description || "")
    }));
  } catch (error) {
    console.error("Failed to get subcategories:", error);
    return [];
  }
}

export async function getSubcategoriesForCategory(categoryId: number): Promise<Subcategory[]> {
  try {
    const res = await sql`
      SELECT id, name, parent_category_id, description
      FROM subcategories
      WHERE parent_category_id = ${categoryId}
      ORDER BY name ASC
    `;
    return res.map(row => ({
      id: Number(row.id),
      name: String(row.name),
      parent_category_id: Number(row.parent_category_id),
      description: String(row.description || "")
    }));
  } catch (error) {
    console.error("Failed to get subcategories for category:", error);
    return [];
  }
}

export async function getRelatedSubcategories(subcategoryId: number): Promise<Subcategory[]> {
  try {
    const res = await sql`
      SELECT id, name, parent_category_id, description
      FROM subcategories
      WHERE id IN (
        SELECT object_id FROM subcategory_relations WHERE subject_id = ${subcategoryId}
        UNION
        SELECT subject_id FROM subcategory_relations WHERE object_id = ${subcategoryId}
      )
      ORDER BY name ASC
    `;
    return res.map(row => ({
      id: Number(row.id),
      name: String(row.name),
      parent_category_id: Number(row.parent_category_id),
      description: String(row.description || "")
    }));
  } catch (error) {
    console.error("Failed to get related subcategories:", error);
    return [];
  }
}
