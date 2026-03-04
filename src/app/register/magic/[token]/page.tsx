import { redirect } from 'next/navigation';

export default function PublicMagicRegisterRedirect({ params }: { params: { token: string } }) {
  const token = params?.token || '';
  const portalBase = process.env.NEXT_PUBLIC_ERP_URL || process.env.NEXT_PUBLIC_PORTAL_BASE_URL || process.env.NEXT_PUBLIC_PORTAL_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '');
  if (!portalBase || !token) {
    redirect('/admissions');
  }
  redirect(`${String(portalBase).replace(/\/+$/, '')}/register/magic/${encodeURIComponent(String(token))}`);
}

