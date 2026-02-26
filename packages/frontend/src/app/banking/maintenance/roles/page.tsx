import { redirect } from 'next/navigation';

const ACCESS_MANAGEMENT_BASE_PATH = '/banking/maintenance/access-management';
const VALID_TABS = new Set(['roles', 'users', 'permissions', 'matrix', 'assignments']);

type SearchParamsInput = Record<string, string | string[] | undefined>;

const pickFirst = (value?: string | string[]): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const normalizeTab = (value?: string): string => {
  const tab = (value || '').toLowerCase();
  return VALID_TABS.has(tab) ? tab : 'roles';
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedSearchParams = await searchParams;
  const tab = normalizeTab(pickFirst(resolvedSearchParams?.tab));
  const targetPath = tab === 'roles'
    ? ACCESS_MANAGEMENT_BASE_PATH
    : `${ACCESS_MANAGEMENT_BASE_PATH}/${tab}`;

  const nextQuery = new URLSearchParams();

  Object.entries(resolvedSearchParams || {}).forEach(([key, rawValue]) => {
    if (key === 'tab') return;
    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => {
        if (typeof value === 'string') nextQuery.append(key, value);
      });
      return;
    }
    if (typeof rawValue === 'string') {
      nextQuery.set(key, rawValue);
    }
  });

  const queryString = nextQuery.toString();
  redirect(queryString ? `${targetPath}?${queryString}` : targetPath);
}
