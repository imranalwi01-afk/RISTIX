import { redirect } from 'next/navigation';

export default function PlatformLoginPage() {
  redirect('/login?role=platform_admin');
}
