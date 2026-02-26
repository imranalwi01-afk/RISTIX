import RoleDetailPage from '@/components/roles/RoleDetailPage';

export default async function UserManagementRoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  return <RoleDetailPage roleId={roleId} />;
}
