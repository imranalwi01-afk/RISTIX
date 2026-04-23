import { redirect } from 'next/navigation';
import { canonicalRoutes } from '@/features/shared/routing/canonical-routes';

export default function LegacyIfrs9ReportsPage() {
  redirect(canonicalRoutes.ifrs9ReportsRoot);
}
