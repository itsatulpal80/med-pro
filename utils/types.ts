export type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    role?: string;
  };
};

export type MedicineBatch = {
  batchNumber: string;
  expiry: string;
  expiryDate?: string;
  quantity: number;
  purchaseRate: number;
  mrp: number;
};

export type Medicine = {
  id: string;
  name: string;
  distributor: string;
  quantity: number;
  expiry: string;
  batches?: MedicineBatch[];
};

export type DashboardStats = {
  todaysSales: number;
  lowStockCount: number;
  expiryAlerts: number;
};

export type OCRMedicine = {
  name: string;
  distributor?: string;
  quantity: number;
  purchaseRate: number;
  mrp: number;
  expiry: string;
  expiryDate?: string;
  batchNumber: string;
};

export type OCRResult = {
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  medicines: OCRMedicine[];
};

export type ManualStockInput = {
  name: string;
  distributor?: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchaseRate: number;
  mrp: number;
};

export type DashboardResponse = {
  totalSales: number;
  lowStockCount: number;
  expiryCount: number;
  totalInvoices: number;
};
