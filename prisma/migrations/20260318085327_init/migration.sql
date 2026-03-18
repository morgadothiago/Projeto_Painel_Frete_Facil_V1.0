-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'COMPANY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "photo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "tradeName" TEXT,
    CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "companyId" TEXT,
    "driverId" TEXT,
    CONSTRAINT "addresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "addresses_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vehicle_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "maxWeight" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "basePrice" DECIMAL NOT NULL DEFAULT 0,
    "pricePerKm" DECIMAL NOT NULL DEFAULT 0,
    "helperPrice" DECIMAL NOT NULL DEFAULT 0,
    "additionalStopPrice" DECIMAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "vehicleTypeId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    CONSTRAINT "vehicles_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vehicles_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "pixKey" TEXT NOT NULL,
    "pixKeyType" TEXT NOT NULL,
    CONSTRAINT "bank_accounts_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverId" TEXT,
    "vehicleTypeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "originStreet" TEXT NOT NULL,
    "originNumber" TEXT NOT NULL,
    "originNeighborhood" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "originState" TEXT NOT NULL,
    "originZipCode" TEXT NOT NULL,
    "originLat" REAL,
    "originLng" REAL,
    "destinationStreet" TEXT NOT NULL,
    "destinationNumber" TEXT NOT NULL,
    "destinationNeighborhood" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "destinationState" TEXT NOT NULL,
    "destinationZipCode" TEXT NOT NULL,
    "destinationLat" REAL,
    "destinationLng" REAL,
    "cargoDescription" TEXT,
    "weight" REAL,
    "needsHelper" BOOLEAN NOT NULL DEFAULT false,
    "additionalStops" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "scheduledAt" DATETIME,
    "estimatedPrice" DECIMAL,
    "finalPrice" DECIMAL,
    "estimatedDistance" REAL,
    "estimatedDuration" INTEGER,
    "rating" INTEGER,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "deliveries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deliveries_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "deliveries_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "billings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessKey" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "platformFee" DECIMAL NOT NULL DEFAULT 0,
    "netAmount" DECIMAL NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "billings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "billings_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gps_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "heading" REAL,
    "speed" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gps_locations_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gps_locations_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_key" ON "companies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_cpf_key" ON "drivers"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_companyId_key" ON "addresses"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_driverId_key" ON "addresses"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_name_key" ON "vehicle_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_driverId_key" ON "vehicles"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_driverId_key" ON "bank_accounts"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_publicId_key" ON "deliveries"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "billings_accessKey_key" ON "billings"("accessKey");

-- CreateIndex
CREATE UNIQUE INDEX "billings_deliveryId_key" ON "billings"("deliveryId");
