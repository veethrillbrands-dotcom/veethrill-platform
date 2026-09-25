/**
 * Run with:
 * $env:DATABASE_URL = (Get-Content .env.local | Where-Object { $_ -match "^DATABASE_URL=" } | ForEach-Object { $_ -replace "^DATABASE_URL=", "" } | ForEach-Object { $_.Trim('"') })
 * npx tsx scripts/fix-enums-and-pipeline.ts
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // 1. Assign all deals with no pipelineId to the default pipeline
  const defaultPipeline = await db.crmPipeline.findFirst({
    where: { isDefault: true },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (defaultPipeline) {
    const orphanDeals = await db.crmDeal.findMany({ where: { pipelineId: null } });
    const firstStage = defaultPipeline.stages[0];
    if (orphanDeals.length > 0) {
      await db.crmDeal.updateMany({
        where: { pipelineId: null },
        data: {
          pipelineId: defaultPipeline.id,
          ...(firstStage ? { pipelineStageId: firstStage.id } : {}),
        },
      });
      console.log(`✅ Assigned ${orphanDeals.length} deals to pipeline "${defaultPipeline.name}"`);
    } else {
      console.log("ℹ️  No orphan deals found.");
    }
  } else {
    console.log("⚠️  No default pipeline found — visit the Pipeline page first to auto-create it.");
  }

  console.log("✅ Done.");
}

main().catch(console.error).finally(() => db.$disconnect());
