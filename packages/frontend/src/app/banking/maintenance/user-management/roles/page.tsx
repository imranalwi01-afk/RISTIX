import { redirect } from 'next/navigation';

const ACCESS_MANAGEMENT_BASE_PATH = '/banking/maintenance/access-management/roles';

type SearchParamsInput = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextQuery = new URLSearchParams();

  Object.entries(resolvedSearchParams || {}).forEach(([key, rawValue]) => {
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
  redirect(queryString ? `${ACCESS_MANAGEMENT_BASE_PATH}?${queryString}` : ACCESS_MANAGEMENT_BASE_PATH);
}
