import { IADcfDetailClient } from '../IADcfDetailClient';

export default async function IADcfDetailByAccountIdPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const resolvedParams = await params;
  return <IADcfDetailClient accountId={resolvedParams.accountId} />;
}

