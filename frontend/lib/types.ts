export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductImage {
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductAttributes {
  material?: string;
  backrestHeight?: string;
  colour?: string;
  armrests?: string;
  mechanism?: string;
  weightCapacity?: string;
  upholstery?: string;
  dimensions?: string;
}

export interface CategorySummary {
  _id: string;
  name: string;
  slug: string;
  parent?: string | { _id: string; name: string; slug: string } | null;
  description?: string;
  image?: { url: string; publicId?: string };
  sortOrder?: number;
  isActive?: boolean;
  showInNavbar?: boolean;
  subcategories?: CategorySummary[];
  children?: CategorySummary[];
  level?: number;
  productCount?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: CategorySummary | string;
  subcategory?: CategorySummary | string | null;
  classification?: CategorySummary | string | null;
  categories?: string[];
  description: string;
  shortDescription?: string;
  specifications?: ProductSpecification[];
  attributes?: ProductAttributes;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  currency?: string;
  images: ProductImage[];
  stock: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  warranty?: string;
  shippingDetails?: {
    estimatedDays?: number;
    freeShipping?: boolean;
    shippingCharge?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface FeaturedBestsellersResponse {
  bestsellers: Product[];
  featured: Product[];
}

export interface CategoriesResponse {
  categories: CategorySummary[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface UserAddress {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses?: UserAddress[];
}
