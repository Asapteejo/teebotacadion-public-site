'use client'; // ← Required for Framer Motion (client-side animations)

import { useEffect, useState } from 'react';
import Panel from '@/components/Panel';
import { motion } from 'framer-motion';
import { getClientTenantContext } from '@/lib/tenantClient';

async function getCmsData(slug: string) {
  try {
    const { backendBase, query, headers } = getClientTenantContext();
    const url = `${backendBase}/public/site${query ? `?${query}` : ''}`;
    const res = await fetch(url, { next: { revalidate: 3600 }, headers });
    if (res.status === 404) return { __notFound: true, sections: {} };
    if (!res.ok) return { sections: {} };
    const snapshot = await res.json();
    const page = snapshot?.pages?.find((p: any) => p.slug === slug);
    return page || { sections: {} };
  } catch (error) {
    return { sections: {} };
  }
}

export default function About() {
  const [data, setData] = useState<any>({ sections: {} });

  useEffect(() => {
    let active = true;
    (async () => {
      const nextData = await getCmsData('about');
      if (active) setData(nextData || { sections: {} });
    })();
    return () => {
      active = false;
    };
  }, []);

  const sections = data.sections || {};
  const panels = Array.isArray(sections.panels)
    ? sections.panels
    : [
        sections.about?.text ? { title: sections.about?.panelTitle || 'About', text: sections.about?.text } : null,
        sections.mission?.text ? { title: sections.mission?.title || 'Mission', text: sections.mission?.text } : null,
        sections.campus?.text ? { title: sections.campus?.title || 'Campus', text: sections.campus?.text } : null,
        sections.accreditation?.text
          ? { title: sections.accreditation?.title || 'Accreditation', text: sections.accreditation?.text }
          : null,
        sections.vision?.text ? { title: sections.vision?.title || 'Vision', text: sections.vision?.text } : null,
        sections.values?.text ? { title: sections.values?.title || 'Values', text: sections.values?.text } : null,
      ].filter(Boolean);

  return (
    <main className="pt-20">
      {data.__notFound ? (
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-serif text-primary">Institution not found</h1>
          <p className="mt-4 text-textLight">
            We could not find a school website for this address.
          </p>
        </section>
      ) : null}
      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-serif p-8 text-center text-primary"
      >
        {data.title || sections.hero?.title || 'About'}
      </motion.h1>

      {panels.length ? (
        panels.map((panel: any, index: number) => (
          <motion.div
            key={`${panel.title}-${index}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Panel id={`panel-${index + 1}`} title={panel.title}>
              <p className="text-lg leading-relaxed">{panel.text}</p>
            </Panel>
          </motion.div>
        ))
      ) : (
        <section className="mx-auto max-w-3xl px-6 pb-16 text-center text-textLight">
          About page content has not been configured yet.
        </section>
      )}
    </main>
  );
}
