import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "~/app/_components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <AnalyticsDashboard />;
}
