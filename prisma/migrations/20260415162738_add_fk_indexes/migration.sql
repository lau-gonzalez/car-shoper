-- CreateIndex
CREATE INDEX "Car_agencyId_idx" ON "Car"("agencyId");

-- CreateIndex
CREATE INDEX "Inquiry_agencyId_idx" ON "Inquiry"("agencyId");

-- CreateIndex
CREATE INDEX "Inquiry_carId_idx" ON "Inquiry"("carId");

-- CreateIndex
CREATE INDEX "Seller_agencyId_idx" ON "Seller"("agencyId");
