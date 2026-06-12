import { PageHeader } from "@/components/page-header";
import { ResearchWorkspace } from "@/components/research-workspace";
import { listScrapedData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const scrapedData = await listScrapedData();

  return (
    <>
      <PageHeader
        eyebrow="Research Queue"
        title="Company research"
        description="Create scraped-data records for n8n, inspect scrapedDataId values, and track website discovery and AI summaries."
      />
      <ResearchWorkspace initialRows={scrapedData} />
    </>
  );
}
