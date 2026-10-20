import { redirect } from 'next/navigation';
import { getSlugs } from '@/registry';

export default function Home() {
  const [first] = getSlugs();
  redirect(`/components/${first ?? 'accordion'}`);
}