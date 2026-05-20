export type NewsDemoInput = {
  descripcion: string;
  tono: string;
  publicoObjetivo: string;
};

export type GeneratedNews = {
  titulo: string;
  resumen: string;
  contenido: string;
  slug: string;
};

export type NewsDemoImage = {
  id: string;
  url: string;
  fileName?: string;
  description: string;
  altText: string;
  useInWeb: boolean;
  useInInstagram: boolean;
};

export type InstagramContent = {
  caption: string;
  hashtags: string[];
  callToAction: string;
  altText: string;
};

export type GenerateInstagramPayload = {
  news: GeneratedNews;
  images: NewsDemoImage[];
};

export type PublishedDemoNews = GeneratedNews & {
  id: string;
  publishedAt: string;
  images: NewsDemoImage[];
};

export type NewsDemoDraft = {
  input: NewsDemoInput;
  images: NewsDemoImage[];
  news: GeneratedNews | null;
  instagram: InstagramContent | null;
  publishedInDemo: boolean;
};

export type PublishInstagramResponse = {
  success: boolean;
  message: string;
};

export type ApiErrorResponse = {
  message: string;
};
