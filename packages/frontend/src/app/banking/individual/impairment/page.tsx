import { redirect } from 'next/navigation';

type SearchParamsInput = Record<string, string | string[] | undefined>;

const appendQuery = (targetPath: string, searchParams: SearchParamsInput) => {
  const nextQuery = new URLSearchParams();

  Object.entries(searchParams || {}).forEach(([key, rawValue]) => {
    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => {
        if (typeof value === 'string') nextQuery.append(key, value);
      });
      return;
    }
    if (typeof rawValue === 'string') nextQuery.set(key, rawValue);
  });

  const queryString = nextQuery.toString();
  return queryString ? `${targetPath}?${queryString}` : targetPath;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedSearchParams = await searchParams;
  redirect(appendQuery('/banking/individual/assessment', resolvedSearchParams));
}
