import { CustomerWorkspace } from "@/components/customer-workspace";
import { PageHeader } from "@/components/page-header";
import { listCustomers } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <>
      <PageHeader
        eyebrow="Customer Management"
        title="Leads and accounts"
        description="Add customers, import CSVs, trigger calls, export data, and inspect every lead from a practical operations table."
      />
      <CustomerWorkspace initialCustomers={customers} />
    </>
  );
}
