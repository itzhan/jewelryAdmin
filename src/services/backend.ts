import axios from 'axios';

const backendInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
});

export interface StoneFilterItem {
  code: string;
  label: string;
}

export interface StoneFiltersResponse {
  shapes: StoneFilterItem[];
  colors: StoneFilterItem[];
  clarities: StoneFilterItem[];
  cuts: StoneFilterItem[];
  certificates: StoneFilterItem[];
}

export type StoneType = 'natural' | 'lab_grown';

export interface StoneShapeItem {
  id: number;
  code: string;
  displayName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface StoneColorGradeItem {
  id: number;
  code: string;
  displayName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface StoneClarityGradeItem {
  id: number;
  code: string;
  displayName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface StoneCutGradeItem {
  id: number;
  code: string;
  displayName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface StoneCertificateItem {
  id: number;
  code: string;
  displayName: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoneItem {
  id: number;
  type: StoneType;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  certificate?: string;
  ratio: number;
  price: number;
  currency: string;
  lengthMm?: number;
  widthMm?: number;
  depthMm?: number;
  isAvailable?: boolean;
}

export interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface StoneListResponse {
  data: StoneItem[];
  meta: PaginationMeta;
}

export interface StoneFiltersApiResponse {
  data: StoneFiltersResponse;
}

export interface StoneListApiResponse extends StoneListResponse {}

export interface StoneListParams {
  page?: number;
  pageSize?: number;
  shape?: string;
  color?: string[];
  clarity?: string[];
  cut?: string;
  minCarat?: number;
  maxCarat?: number;
  minBudget?: number;
  maxBudget?: number;
  certificate?: string[];
  type?: StoneType;
}

export interface StonePayload {
  type: StoneType;
  shapeCode: string;
  carat: number;
  colorCode: string;
  clarityCode: string;
  cutCode: string;
  certificateCode?: string;
  ratio: number;
  lengthMm?: number;
  widthMm?: number;
  depthMm?: number;
  price: number;
  currency: string;
  isAvailable?: boolean;
}

export const getStoneFilters = async () => {
  const res = await backendInstance.get<StoneFiltersApiResponse>('/stones/filters');
  return res.data.data;
};

export const getStoneList = async (params: StoneListParams) => {
  const res = await backendInstance.get<StoneListApiResponse>('/stones', {
    params,
  });
  return res.data;
};

export const createStone = async (payload: StonePayload) => {
  const res = await backendInstance.post<{ data: StoneItem }>('/stones', payload);
  return res.data.data;
};

export const updateStone = async (id: number, payload: Partial<StonePayload>) => {
  const res = await backendInstance.patch<{ data: StoneItem }>(`/stones/${id}`, payload);
  return res.data.data;
};

export const deleteStone = async (id: number) => {
  await backendInstance.delete(`/stones/${id}`);
};

export const getStoneShapes = async () => {
  const res = await backendInstance.get<{ data: StoneShapeItem[] }>('/stones/shapes');
  return res.data.data;
};

export const getStoneColorGrades = async () => {
  const res = await backendInstance.get<{ data: StoneColorGradeItem[] }>('/stones/colors');
  return res.data.data;
};

export const getStoneClarityGrades = async () => {
  const res = await backendInstance.get<{ data: StoneClarityGradeItem[] }>('/stones/clarities');
  return res.data.data;
};

export const getStoneCutGrades = async () => {
  const res = await backendInstance.get<{ data: StoneCutGradeItem[] }>('/stones/cuts');
  return res.data.data;
};

export const getStoneCertificates = async () => {
  const res = await backendInstance.get<{ data: StoneCertificateItem[] }>('/stones/certificates');
  return res.data.data;
};

export interface StoneEnumPayload {
  code: string;
  displayName: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface StoneCertificatePayload extends StoneEnumPayload {
  website?: string;
}

export const createStoneShape = async (payload: StoneEnumPayload) => {
  const res = await backendInstance.post<{ data: StoneShapeItem }>('/stones/shapes', payload);
  return res.data.data;
};

export const updateStoneShape = async (id: number, payload: Partial<StoneEnumPayload>) => {
  const res = await backendInstance.patch<{ data: StoneShapeItem }>(`/stones/shapes/${id}`, payload);
  return res.data.data;
};

export const deleteStoneShape = async (id: number) => {
  await backendInstance.delete(`/stones/shapes/${id}`);
};

export const createStoneColorGrade = async (payload: StoneEnumPayload) => {
  const res = await backendInstance.post<{ data: StoneColorGradeItem }>('/stones/colors', payload);
  return res.data.data;
};

export const updateStoneColorGrade = async (id: number, payload: Partial<StoneEnumPayload>) => {
  const res = await backendInstance.patch<{ data: StoneColorGradeItem }>(`/stones/colors/${id}`, payload);
  return res.data.data;
};

export const deleteStoneColorGrade = async (id: number) => {
  await backendInstance.delete(`/stones/colors/${id}`);
};

export const createStoneClarityGrade = async (payload: StoneEnumPayload) => {
  const res = await backendInstance.post<{ data: StoneClarityGradeItem }>('/stones/clarities', payload);
  return res.data.data;
};

export const updateStoneClarityGrade = async (id: number, payload: Partial<StoneEnumPayload>) => {
  const res = await backendInstance.patch<{ data: StoneClarityGradeItem }>(`/stones/clarities/${id}`, payload);
  return res.data.data;
};

export const deleteStoneClarityGrade = async (id: number) => {
  await backendInstance.delete(`/stones/clarities/${id}`);
};

export const createStoneCutGrade = async (payload: StoneEnumPayload) => {
  const res = await backendInstance.post<{ data: StoneCutGradeItem }>('/stones/cuts', payload);
  return res.data.data;
};

export const updateStoneCutGrade = async (id: number, payload: Partial<StoneEnumPayload>) => {
  const res = await backendInstance.patch<{ data: StoneCutGradeItem }>(`/stones/cuts/${id}`, payload);
  return res.data.data;
};

export const deleteStoneCutGrade = async (id: number) => {
  await backendInstance.delete(`/stones/cuts/${id}`);
};

export const createStoneCertificate = async (payload: StoneCertificatePayload) => {
  const res = await backendInstance.post<{ data: StoneCertificateItem }>('/stones/certificates', payload);
  return res.data.data;
};

export const updateStoneCertificate = async (id: number, payload: Partial<StoneCertificatePayload>) => {
  const res = await backendInstance.patch<{ data: StoneCertificateItem }>(`/stones/certificates/${id}`, payload);
  return res.data.data;
};

export const deleteStoneCertificate = async (id: number) => {
  await backendInstance.delete(`/stones/certificates/${id}`);
};

export interface ProductCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface ProductCategoryListApiResponse {
  data: ProductCategory[];
}

export interface ProductListItem {
  id: number;
  sku?: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  colors: string[];
  categoryCode?: string;
  categoryName?: string;
  isCustomizable?: boolean;
  minCarat?: number;
  maxCarat?: number;
}

export interface ProductListApiResponse {
  data: ProductListItem[];
  meta: PaginationMeta;
}

export interface ProductListParams {
  categoryCode?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductCategoryPayload {
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface ProductPayload {
  categoryCode: string;
  name: string;
  sku: string;
  basePrice: number;
  currency: string;
  defaultImageUrl: string;
  availableColors?: string[];
  description: string;
  minCarat?: number;
  maxCarat?: number;
  isCustomizable?: boolean;
}

export const getProductCategories = async () => {
  const res = await backendInstance.get<ProductCategoryListApiResponse>('/products/categories');
  return res.data.data;
};

export const getProductList = async (params: ProductListParams) => {
  const res = await backendInstance.get<ProductListApiResponse>('/products', {
    params,
  });
  return res.data;
};

export const createProductCategory = async (payload: ProductCategoryPayload) => {
  const res = await backendInstance.post<{ data: ProductCategory }>('/products/categories', payload);
  return res.data.data;
};

export const updateProductCategory = async (id: number, payload: Partial<ProductCategoryPayload>) => {
  const res = await backendInstance.patch<{ data: ProductCategory }>(`/products/categories/${id}`, payload);
  return res.data.data;
};

export const deleteProductCategory = async (id: number) => {
  await backendInstance.delete(`/products/categories/${id}`);
};

export const createProduct = async (payload: ProductPayload) => {
  const res = await backendInstance.post<{ data: any }>('/products', payload);
  return res.data.data;
};

export const updateProduct = async (id: number, payload: Partial<ProductPayload>) => {
  const res = await backendInstance.patch<{ data: any }>(`/products/${id}`, payload);
  return res.data.data;
};

export const deleteProduct = async (id: number) => {
  await backendInstance.delete(`/products/${id}`);
};

export interface ProductImageItem {
  id: number;
  productId?: number;
  productName?: string;
  imageUrl: string;
  altText: string;
  badge?: string;
  aspectRatio: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductImageListApiResponse {
  data: ProductImageItem[];
}

export interface ProductImageListParams {
  productId?: number;
}

export const getProductImages = async (params?: ProductImageListParams) => {
  const res = await backendInstance.get<ProductImageListApiResponse>('/products/images', {
    params,
  });
  return res.data.data;
};

export interface ProductImagePayload {
  productId: number;
  imageUrl: string;
  altText: string;
  badge?: string;
  aspectRatio: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export const createProductImage = async (payload: ProductImagePayload) => {
  const res = await backendInstance.post<{ data: ProductImageItem }>('/products/images', payload);
  return res.data.data;
};

export const updateProductImage = async (id: number, payload: Partial<ProductImagePayload>) => {
  const res = await backendInstance.patch<{ data: ProductImageItem }>(`/products/images/${id}`, payload);
  return res.data.data;
};

export const deleteProductImage = async (id: number) => {
  await backendInstance.delete(`/products/images/${id}`);
};
