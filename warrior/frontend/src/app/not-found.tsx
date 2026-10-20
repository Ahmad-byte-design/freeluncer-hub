import Link from 'next/link';
import { components } from '@/registry';
import { Logo } from '@/shared/icons';

export default function NotFound() {
  const first = components[0];

  return (
    <div className="wr-notfound">
      <Logo size={34} />
      <h1>No such component</h1>
      <p>
        The registry has {components.length === 1 ? 'one entry' : `${components.length} entries`}:{' '}
        {components.map((component) => component.name).join(', ')}. Nothing is registered under that
        name yet.
      </p>
      <Link className="wr-btn wr-btn--primary" href={`/components/${first?.slug ?? 'accordion'}`}>
        Back to {first?.name ?? 'the docs'}
      </Link>
    </div>
  );
}