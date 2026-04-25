import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Root page - redirects to login or chat based on auth status
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/chat');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading CreditAssist...</p>
    </div>
  );
}
