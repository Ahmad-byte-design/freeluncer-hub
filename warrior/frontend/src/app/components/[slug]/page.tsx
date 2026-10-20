import { notFound } from 'next/navigation';
import { components, getBySlug } from '@/registry';
import { readAssets } from '@/registry/assets';
import { DocsShell } from '@/features/docs-shell/docs-shell';
import { ComponentPage } from '@/features/component-page/component-page';

export function generateStaticParams() {
  return components.map((component) => ({ slug: component.slug }));
}

export default async function ComponentRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getBySlug(slug);
  if (!meta) notFound();

  // Only serialisable data crosses into the client shell. The registry itself is
  // imported on both sides, so the client looks the component back up by slug.
  const assets = readAssets(meta);

  return (
    <DocsShell slug={meta.slug} assets={assets}>
      <ComponentPage slug={meta.slug} />
    </DocsShell>
  );
}