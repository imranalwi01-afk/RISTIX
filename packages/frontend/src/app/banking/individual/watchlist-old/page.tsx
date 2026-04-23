import { redirect } from 'next/navigation';
import { canonicalRoutes } from '@/features/shared/routing/canonical-routes';

export default function WatchlistOldPage() {
  redirect(canonicalRoutes.individualAssessment);
}
