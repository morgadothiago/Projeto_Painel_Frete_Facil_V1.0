-- CreateTable
CREATE TABLE "freight_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "platformFeePct" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "insuranceFeePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tollReimburse" BOOLEAN NOT NULL DEFAULT false,
    "nightSurcharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekendSurcharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freight_config_pkey" PRIMARY KEY ("id")
);
