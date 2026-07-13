export interface BrandProduct {
  description: string;
  brandName: string;
  category: string;
  masterImageUrl?: string;
  createdAt: number;
}

export interface MediumShot {
  id: string;
  mediumName: string; // "Billboard", "Newspaper", "Social Post", "Magazine Ad", "Bus Shelter"
  imageUrl?: string;
  aspectRatio: string; // "1:1" | "16:9" | "3:4" | "9:16"
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

export interface BrandProject {
  id: string;
  product: BrandProduct;
  shots: MediumShot[];
  createdAt: number;
}
