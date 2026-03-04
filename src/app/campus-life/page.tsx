'use client'; // Required for Framer Motion

import { useEffect, useState } from 'react';
import Panel from '@/components/Panel';
import TestimonialCarousel from '@/components/TestimonialCarousel';
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

export default function CampusLife() {
  const [data, setData] = useState<any>({ sections: {} });

  useEffect(() => {
    let active = true;
    (async () => {
      const nextData = await getCmsData('campus-life');
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
        sections.community?.text
          ? { title: sections.community?.title || 'Community of Learning', text: sections.community?.text }
          : null,
        sections.experiential?.text
          ? { title: sections.experiential?.title || 'Experiential Learning', text: sections.experiential?.text }
          : null,
        sections.residential?.text
          ? { title: sections.residential?.title || 'Residential Life', text: sections.residential?.text }
          : null,
        sections.honor?.text
          ? { title: sections.honor?.title || 'Honor Code', text: sections.honor?.text }
          : null,
      ].filter(Boolean);

  const testimonials = Array.isArray(sections.testimonials) ? sections.testimonials : [];

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
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-4xl md:text-5xl font-serif p-8 text-center text-primary"
      >
        {data.title || sections.hero?.title || 'Campus Life'}
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
          Campus life content has not been configured yet.
        </section>
      )}

      {testimonials.length ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <TestimonialCarousel testimonials={testimonials} />
        </motion.div>
      ) : null}
    </main>
  );
}
