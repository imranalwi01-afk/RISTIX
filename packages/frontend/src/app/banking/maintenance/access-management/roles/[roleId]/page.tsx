import RoleDetailPage from '@/components/roles/RoleDetailPage';

export default async function AccessManagementRoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  return <RoleDetailPage roleId={roleId} />;
}
