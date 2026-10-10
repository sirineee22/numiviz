export interface ContentBlock {
  id: string;
  type: 'video' | 'text' | 'image' | 'file' | 'quiz' | 'exercice' | 'video_manim' | 'desmos' | 'key_takeaways';
  content: unknown;
  order: number;
}

export interface KeyTakeawaysContent {
  title?: string;
  items: string[];  // Each string is one takeaway bullet
}