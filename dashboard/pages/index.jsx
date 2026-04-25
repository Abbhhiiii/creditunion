import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Root page - redirects to dashboard
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading CreditAssist Dashboard...</p>
    </div>
  );
}
