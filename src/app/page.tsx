import { Dashboard } from "@/components/home/Dashboard";

type RawParams = Record<string, string | string[] | undefined>;

/**
 * Server entry: forwards the query string to the client dashboard so the
 * view state (?ra=&dec=&fov=&band=&star=&epoch=&embed=1) can be hydrated
 * and shared.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;
  return <Dashboard urlParams={params} />;
}
