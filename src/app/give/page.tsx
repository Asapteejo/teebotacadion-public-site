'use client';

import { useEffect, useState } from 'react';
import Panel from '@/components/Panel';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import CtaButton from '@/components/CtaButton';
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

export default function Give() {
  const [data, setData] = useState<any>({ sections: {} });

  useEffect(() => {
    let active = true;
    (async () => {
      const nextData = await getCmsData('give');
      if (active) setData(nextData || { sections: {} });
    })();
    return () => {
      active = false;
    };
  }, []);

  const sections = data.sections || {};
  const hero = sections.hero || {};
  const waysToGive = Array.isArray(sections.waysToGive) ? sections.waysToGive : [];
  const investCards = Array.isArray(sections.investCards) ? sections.investCards : [];
  const testimonials = Array.isArray(sections.testimonials) ? sections.testimonials : [];

  const hasContent =
    hero.title ||
    hero.text ||
    waysToGive.length ||
    sections.legacy?.text ||
    investCards.length ||
    testimonials.length;

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

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hero bg-cover text-center p-16 md:p-24 text-white min-h-[70vh] flex flex-col justify-center"
        style={{
          backgroundImage: hero.backgroundImage ? `url(${hero.backgroundImage})` : 'none',
        }}
      >
        {hero.title ? (
          <h1 className="text-5xl md:text-7xl font-serif mb-6">{hero.title}</h1>
        ) : null}
        {hero.text ? (
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            {hero.text}
          </p>
        ) : null}
        {hero.ctaText && hero.ctaLink ? (
          <div className="mt-8">
            <CtaButton href={hero.ctaLink}>{hero.ctaText}</CtaButton>
          </div>
        ) : null}
      </motion.section>

      {waysToGive.length ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Panel id="panel-01" title={sections.waysToGive?.title || 'Ways to Give'}>
            <ul className="grid md:grid-cols-2 gap-6 mt-6">
              {waysToGive.map((way: string) => (
                <li
                  key={way}
                  className="bg-neutral p-6 rounded-lg shadow-sm text-lg font-medium text-center"
                >
                  {way}
                </li>
              ))}
            </ul>
          </Panel>
        </motion.div>
      ) : null}

      {sections.legacy?.text ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Panel id="panel-02" title={sections.legacy?.title || 'Legacy Giving'}>
            <p className="text-lg leading-relaxed mb-6">{sections.legacy.text}</p>
            {sections.legacy?.ctaText && sections.legacy?.ctaLink ? (
              <div className="mt-6 text-center">
                <CtaButton href={sections.legacy.ctaLink} variant="secondary">
                  {sections.legacy.ctaText}
                </CtaButton>
              </div>
            ) : null}
          </Panel>
        </motion.div>
      ) : null}

      {investCards.length ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Panel id="panel-03" title={sections.invest?.title || 'Invest in Legacy'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {investCards.map((card: { title: string; text: string }, index: number) => (
                <div
                  key={index}
                  className="bg-neutral p-8 rounded-lg shadow-sm hover:shadow-medium transition-shadow duration-300"
                >
                  <h3 className="text-2xl font-serif mb-4 text-primary">{card.title}</h3>
                  <p className="text-textLight">{card.text}</p>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>
      ) : null}

      {testimonials.length ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <TestimonialCarousel testimonials={testimonials} />
        </motion.div>
      ) : null}

      {!hasContent ? (
        <section className="mx-auto max-w-3xl px-6 pb-16 text-center text-textLight">
          Giving content has not been configured yet.
        </section>
      ) : null}
    </main>
  );
}
