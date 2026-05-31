import { apiJson } from './client';
import type { Category } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  return apiJson<Category[]>('/categories/');
}
