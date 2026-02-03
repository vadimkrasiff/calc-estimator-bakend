export interface Material {
  id: string;
  name: string;
  description?: string;
  unit: string;
  categoryId?: number;
  categoryName?: string; 
  createdAt: string;
  width?: number;               // мм
  height?: number;              // мм
  nominalWidth?: number;               // мм
  nominalHeight?: number;  
  defaultWasteFactor?: number;
  latestPrice?: number | null;
  latestSupplier?: string | null;
  latestPriceDate?: string | null;
}

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface MaterialPrice {
  id: string;
  materialId?: string;
  materialName?: string;
  price: number;
  supplier: string;
  date?: string;
}

export interface HouseType {
  id: number;
  name: string;
  description?: string;
  ceilingHeight?: number;
  floorCountMax?: number;
  roofType: 'gable' | 'hip' | 'flat' | 'shed';
  roofPitch: number;          // отношение (например, 0.5)
  floorJoistSpacing: number;  // метры (например, 0.6)
  createdAt: string;
  houseTypeCategory?: string | null;
}

export interface HouseTypeMaterial {
  id: string;
  houseTypeId: string;
  materialId: string;
  materialName?: string;
  unit: string;
  calculationType: string;

  // ← из materials
  defaultWasteFactor?: number;
  width?: number;
  height?: number;
  description?: string;

  // ← из material_prices
  latestPrice: number | null;
  latestSupplier: string | null;
  latestPriceDate: string | null;
}


export interface MaterialCalculationParam {
  id: string;
  materialId: string;
  paramKey: string;
  paramLabel: string;
  paramValue: number;
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  createdAt: string;
}