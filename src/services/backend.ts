import axios from 'axios';

const backendInstance = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_BACKEND_BASE_URL || 'http://localhost:3000',
  timeout: 5 * 60 * 1000, // 5 分钟，避免同步超时
  maxContentLength: 200 * 1024 * 1024, // 支持大响应体（200MB）
  maxBodyLength: 200 * 1024 * 1024,
});

export interface StoneFilterItem {
  code: string;
  label: string;
  iconSvg?: string;
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
  iconSvg?: string;
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
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoneItem {
  id: number;
  name: string;
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
  isAvailable?: boolean;
  externalId?: number;
  externalDRef?: string;
  externalReportNo?: string;
  externalCertNo?: string;
  externalCertType?: string;
  externalPolish?: string;
  externalSymmetry?: string;
  externalFluorescence?: string;
  externalDepthPercent?: number;
  externalTablePercent?: number;
  externalM1?: number;
  externalM2?: number;
  externalM3?: number;
  externalRate?: number;
  externalDiscount?: number;
  externalLocation?: string;
  externalNatts?: string;
  externalMilky?: string;
  externalEyeClean?: string;
  externalBrowness?: string;
  externalIsBuy?: boolean;
  externalIsSpecialOffer?: boolean;
  externalIsAuction?: boolean;
  externalRap?: number;
  externalUpdateTime?: string;
  externalVideoUrl?: string;
  externalDaylightUrl?: string;
  externalBt?: string;
  externalBc?: string;
  externalWt?: string;
  externalWc?: string;
  externalSupplement1?: string;
  externalSupplement10?: string;
  externalSupplement11?: string;
  externalSupplement12?: string;
  externalSupplement13?: string;
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
  hasImages?: boolean;
  hasVideo?: boolean;
}

export interface StonePayload {
  name: string;
  type: StoneType;
  shapeCode: string;
  carat: number;
  colorCode: string;
  clarityCode: string;
  cutCode: string;
  certificateCode?: string;
  ratio: number;
  price: number;
  currency: string;
  isAvailable?: boolean;
  images?: StoneImageData[];
  externalData?: StoneExternalDataPayload;
}

export interface StoneExternalDataPayload {
  externalReportNo?: string;
  externalDRef?: string;
  externalCertNo?: string;
  externalRate?: number;
  externalDiscount?: number;
  externalLocation?: string;
  externalRemark?: string;
  externalPolish?: string;
  externalSymmetry?: string;
  externalDepthPercent?: number;
  externalTablePercent?: number;
  externalBrowness?: string;
  externalEyeClean?: string;
  externalVideoUrl?: string;
}

export interface StoneImageData {
  imageUrl: string;
  altText: string;
  badge?: string;
  aspectRatio: 'square' | 'portrait';
  sortOrder: number;
  isPrimary: boolean;
}

export interface StoneImageDetail {
  url: string;
  alt: string;
  badge?: string;
  aspect: 'square' | 'portrait';
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface StoneDetail extends StoneItem {
  images: StoneImageDetail[];
}

export interface ExternalStoneSyncRecord {
  externalId: number;
  localStoneId: number;
  dRef?: string;
  reportNo?: string;
  shape?: string;
  carat?: number;
  color?: string;
  clarity?: string;
  cut?: string;
  rate?: number;
  location?: string;
  certificate?: string;
}

export interface ExternalStoneSyncResponse {
  importedCount: number;
  list: ExternalStoneSyncRecord[];
}

export interface ExternalStoneSyncAllResponse {
  totalPages: number;
  processedPages: number;
  totalProcessed: number;
  created: number;
  updated: number;
}

export interface ExternalStoneSyncParams {
  appid?: string;
  secret?: string;
  dSizeMin?: number;
  dSizeMax?: number;
  pageint?: number;
  pagesize?: number;
}

export const getStoneDetail = async (id: number) => {
  const res = await backendInstance.get<{ data: StoneDetail }>(`/stones/${id}`);
  return res.data.data;
};

export const syncExternalStones = async (params: ExternalStoneSyncParams) => {
  const res = await backendInstance.post<{ data: ExternalStoneSyncResponse }>(
    '/stones/external-sync',
    params,
  );
  return res.data.data;
};

export const syncAllExternalStones = async (params: Partial<ExternalStoneSyncParams>) => {
  const res = await backendInstance.post<{ data: ExternalStoneSyncAllResponse }>(
    '/stones/external-sync-all',
    params,
  );
  return res.data.data;
};

// 获取缺失的形状列表
export interface MissingShape {
  code: string;
  displayName: string;
  count: number;
}

export const getMissingShapes = async () => {
  const res = await backendInstance.get<{ data: MissingShape[] }>('/stones/shapes/missing');
  return res.data.data;
};

// 批量创建形状
export const batchCreateShapes = async (shapes: Array<{ code: string; displayName: string }>) => {
  const res = await backendInstance.post<{ data: any[] }>('/stones/shapes/batch', { shapes });
  return res.data.data;
};

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
  iconSvg?: string;
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
  iconSvg?: string;
}

export interface ProductImageDetail {
  url: string;
  alt: string;
  badge?: string;
  aspect: 'square' | 'portrait';
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  basePrice: number;
  currency: string;
  description?: string;
  category: {
    code: string;
    name: string;
  };
  availableColors?: string[];
  minCarat?: number;
  maxCarat?: number;
  isCustomizable?: boolean;
  images: ProductImageDetail[];
}

export const getProductDetail = async (id: number) => {
  const res = await backendInstance.get<{ data: ProductDetail }>(`/products/${id}`);
  return res.data.data;
};

export interface ProductCategoryListApiResponse {
  items: ProductCategory[];
  meta: PaginationMeta;
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
  iconSvg?: string;
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
  images?: ProductImageData[];
}

export const getProductCategories = async (page?: number, pageSize?: number) => {
  const res = await backendInstance.get<ProductCategoryListApiResponse>('/products/categories', {
    params: { page, pageSize },
  });
  return res.data;
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

// 图片数据现在作为 JSONB 数组存储在产品中
export interface ProductImageData {
  imageUrl: string;
  altText: string;
  badge?: string;
  aspectRatio: 'square' | 'portrait';
  sortOrder: number;
  isPrimary: boolean;
}

// ========== Materials ==========

export interface Material {
  id: number;
  code: string;
  name: string;
  karat?: string;
  description?: string;
  svgIcon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MaterialListApiResponse {
  items: Material[];
  meta: PaginationMeta;
}

export interface MaterialPayload {
  code: string;
  name: string;
  karat?: string;
  description?: string;
  svgIcon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const getMaterials = async (page?: number, pageSize?: number) => {
  const res = await backendInstance.get<MaterialListApiResponse>('/products/materials', {
    params: { page, pageSize },
  });
  return res.data;
};

export const getMaterialById = async (id: number) => {
  const res = await backendInstance.get<{ data: Material }>(`/products/materials/${id}`);
  return res.data.data;
};

export const createMaterial = async (payload: MaterialPayload) => {
  const res = await backendInstance.post<{ data: Material }>('/products/materials', payload);
  return res.data.data;
};

export const updateMaterial = async (id: number, payload: Partial<MaterialPayload>) => {
  const res = await backendInstance.patch<{ data: Material }>(`/products/materials/${id}`, payload);
  return res.data.data;
};

export const deleteMaterial = async (id: number) => {
  await backendInstance.delete(`/products/materials/${id}`);
};

export interface StoneImageItem {
  id: number;
  stoneId?: number;
  stoneName?: string;
  stoneLabel?: string;
  imageUrl: string;
  altText: string;
  badge?: string;
  aspectRatio: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface StoneImageListApiResponse {
  data: StoneImageItem[];
}

export interface StoneImageListParams {
  stoneId?: number;
  stoneName?: string;
}

export const getStoneImages = async (params?: StoneImageListParams) => {
  const res = await backendInstance.get<StoneImageListApiResponse>('/stones/images', {
    params,
  });
  return res.data.data;
};

export interface StoneImagePayload {
  stoneId?: number;
  stoneName?: string;
  imageUrl: string;
  altText: string;
  badge?: string;
  aspectRatio: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export const createStoneImage = async (payload: StoneImagePayload) => {
  const res = await backendInstance.post<{ data: StoneImageItem }>('/stones/images', payload);
  return res.data.data;
};

export const updateStoneImage = async (id: number, payload: Partial<StoneImagePayload>) => {
  const res = await backendInstance.patch<{ data: StoneImageItem }>(`/stones/images/${id}`, payload);
  return res.data.data;
};

export const deleteStoneImage = async (id: number) => {
  await backendInstance.delete(`/stones/images/${id}`);
};
