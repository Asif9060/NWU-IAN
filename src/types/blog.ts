export type BlogPost = {
   _id: string;
   slug: string;
   title: string;
   excerpt?: string;
   content: string; // Markdown বা HTML (backend অনুযায়ী)
   featuredImage?: string;
   category?: string;
   isPublished: boolean;
   createdAt?: string;
   updatedAt?: string;
};

export type PaginatedResponse<T> = {
   data: T[];
   total?: number;
   page?: number;
   pageSize?: number;
};

export type Category = {
   _id: string;
   name: string;
   createdAt?: string;
   updatedAt?: string;
};
