export interface Media {
  id: number;
  gesture_id: number;
  file_url: string;
  media_type: "image" | "video" | "gif";
  order: number;
  created_at: string;
}

export interface Gesture {
  id: number;
  title: string;
  description: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  media: Media[];
}

export interface GestureCreate {
  title: string;
  description?: string;
  category_id?: number;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}
