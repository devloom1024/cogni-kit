-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'DELETED');

-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('github', 'google', 'linuxdo');

-- CreateEnum
CREATE TYPE "VerificationCodeType" AS ENUM ('register', 'login', 'forgot_password', 'bind_email', 'bind_phone');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'INDEX', 'ETF', 'LOF', 'OFUND');

-- CreateEnum
CREATE TYPE "IndexType" AS ENUM ('BROAD', 'SECTOR', 'THEME', 'STRATEGY');

-- CreateEnum
CREATE TYPE "Exchange" AS ENUM ('SSE', 'SZSE', 'BJSE', 'HKEX');

-- CreateEnum
CREATE TYPE "FundType" AS ENUM ('MONEY_NORMAL', 'MONEY_FLOATING', 'BOND_LONG', 'BOND_SHORT', 'BOND_MIXED_1', 'BOND_MIXED_2', 'MIXED_STOCK', 'MIXED_BOND', 'MIXED_BALANCED', 'MIXED_FLEXIBLE', 'MIXED_ABSOLUTE', 'STOCK', 'INDEX_STOCK', 'INDEX_BOND', 'INDEX_OVERSEAS', 'INDEX_OTHER', 'QDII_STOCK', 'QDII_MIXED_STOCK', 'QDII_MIXED_BOND', 'QDII_MIXED_FLEXIBLE', 'QDII_MIXED_BALANCED', 'QDII_BOND', 'QDII_COMMODITY', 'QDII_FOF', 'QDII_REIT', 'FOF_CONSERVATIVE', 'FOF_BALANCED', 'FOF_AGGRESSIVE', 'REIT', 'COMMODITY', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetMarket" AS ENUM ('CN', 'HK', 'US');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT,
    "password_hash" TEXT,
    "email" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_username" TEXT,
    "provider_email" TEXT,
    "provider_avatar" TEXT,
    "union_id" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "access_token_expires_at" TIMESTAMP(3) NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "refresh_token_expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "last_active_at" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VerificationCodeType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "market" "AssetMarket" NOT NULL,
    "exchange" "Exchange",
    "indexType" "IndexType",
    "fund_company" TEXT,
    "fund_type" "FundType",
    "pinyin_initial" TEXT,
    "pinyin_full" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_groups" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlist_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_items" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "social_accounts_user_id_idx" ON "social_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_provider_provider_id_key" ON "social_accounts"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_access_token_key" ON "sessions"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_access_token_idx" ON "sessions"("access_token");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_idx" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_access_token_expires_at_idx" ON "sessions"("access_token_expires_at");

-- CreateIndex
CREATE INDEX "sessions_revoked_idx" ON "sessions"("revoked");

-- CreateIndex
CREATE INDEX "verification_codes_target_type_idx" ON "verification_codes"("target", "type");

-- CreateIndex
CREATE INDEX "verification_codes_expires_at_idx" ON "verification_codes"("expires_at");

-- CreateIndex
CREATE INDEX "assets_type_idx" ON "assets"("type");

-- CreateIndex
CREATE INDEX "assets_name_idx" ON "assets"("name");

-- CreateIndex
CREATE INDEX "assets_pinyin_initial_idx" ON "assets"("pinyin_initial");

-- CreateIndex
CREATE INDEX "assets_pinyin_full_idx" ON "assets"("pinyin_full");

-- CreateIndex
CREATE INDEX "assets_fund_company_idx" ON "assets"("fund_company");

-- CreateIndex
CREATE UNIQUE INDEX "assets_market_symbol_key" ON "assets"("market", "symbol");

-- CreateIndex
CREATE INDEX "watchlist_groups_user_id_idx" ON "watchlist_groups"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_items_group_id_asset_id_key" ON "watchlist_items"("group_id", "asset_id");

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_groups" ADD CONSTRAINT "watchlist_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "watchlist_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
