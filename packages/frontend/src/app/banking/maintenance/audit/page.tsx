import { redirect } from 'next/navigation';

export default function AuditPage() {
    redirect('/banking/maintenance/user-activity');
}
