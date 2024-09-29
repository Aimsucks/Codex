-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Plugin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "parentCategoryId" INTEGER,
    "name" TEXT NOT NULL,
    "pluginId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlugin" (
    "userId" TEXT NOT NULL,
    "pluginId" INTEGER NOT NULL,

    CONSTRAINT "UserPlugin_pkey" PRIMARY KEY ("userId","pluginId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_id_key" ON "Plugin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_name_key" ON "Plugin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_key" ON "Category"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_pluginId_name_key" ON "Category"("pluginId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Preset_id_key" ON "Preset"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Preset_categoryId_name_key" ON "Preset"("categoryId", "name");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preset" ADD CONSTRAINT "Preset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlugin" ADD CONSTRAINT "UserPlugin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlugin" ADD CONSTRAINT "UserPlugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
