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

const resolveLegacyPath = (slug: string[] | undefined): string => {
  const head = (slug?.[0] || '').toLowerCase();

  if (head === 'assessment') return '/banking/individual/assessment';
  if (head === 'assessment-override') return '/banking/individual/assessment-override';
  if (head === 'override-trigger') return '/banking/individual/override-trigger';
  if (head === 'customer-list') return '/banking/individual/customer-list';
  if (head === 'watchlist') return '/banking/individual/watchlist';
  if (head === 'watchlist-old') return '/banking/individual/watchlist-old';
  if (head === 'reports') return '/banking/individual/reports';
  if (head === 'scenarios') return '/banking/individual/scenarios';
  if (head === 'dcf') return '/banking/individual/dcf';
  if (head === 'dcf-uploads') return '/banking/individual/dcf-uploads';
  if (head === 'ia-detail') return '/banking/individual/ia-detail';
  if (head === 'history') return '/banking/individual/history';
  if (head === 'provision') return '/banking/individual/provision';

  return '/banking/individual/assessment';
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const targetPath = resolveLegacyPath(resolvedParams?.slug);
  redirect(appendQuery(targetPath, resolvedSearchParams));
}
