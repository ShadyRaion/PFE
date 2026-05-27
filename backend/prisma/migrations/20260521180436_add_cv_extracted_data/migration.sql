-- AlterTable
ALTER TABLE "CV" ADD COLUMN     "extractedData" JSONB,
ADD COLUMN     "rawText" TEXT;

-- AlterTable
ALTER TABLE "RecommendationScore" ADD COLUMN     "matchedLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recommendationReason" TEXT,
ADD COLUMN     "scoreBreakdown" JSONB;
