'use client'; // ← Required for Framer Motion (client-side animations)

import Link from 'next/link';
import { motion } from 'framer-motion';

type FooterProps = {
  institution: { name?: string; address?: string; publicAddress?: string };
  footerData?: any; // CMS data (sections JSON)
};

type FooterLink = {
  name: string;
  href: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

type SocialLink = {
  name?: string;
  href?: string;
  iconSvg?: string;
};

export default function Footer({ institution, footerData = {} }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerSections: FooterSection[] = Array.isArray(footerData?.sections?.footerSections)
    ? footerData.sections.footerSections.map((section: FooterSection) => ({
        ...section,
        links: (section.links || []).filter((link) => !!link?.href),
      }))
    : [];

  const newsletterTitle = footerData?.sections?.newsletter?.title || '';
  const newsletterCta = footerData?.sections?.newsletter?.ctaText || '';

  const contactPhone = footerData?.sections?.contact?.phone || '';
  const contactEmail = footerData?.sections?.contact?.email || '';

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-primary text-white"
    >
      {/* Newsletter Section */}
      {newsletterTitle ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-primaryDark py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-serif mb-3">{newsletterTitle}</h3>
            {newsletterCta ? (
              <Link
                href="/subscribe"
                className="inline-block mt-4 px-8 py-3 bg-accent text-white rounded-md font-medium hover:bg-opacity-90 transition-all duration-300"
              >
                {newsletterCta}
              </Link>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {footerSections.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {footerSections.map((section: FooterSection, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <h4 className="font-serif text-lg font-semibold mb-4 text-white">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link: any) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-accent transition-colors duration-300 text-sm"
                      >
                        {link.name || link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mb-12 text-center text-sm text-gray-300">
            Footer links have not been configured yet.
          </div>
        )}

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t border-white/20 pt-8 grid md:grid-cols-3 gap-8"
        >
          <div>
            <h5 className="font-semibold mb-2">Administrative Office</h5>
            <p className="text-gray-300 text-sm">
              {institution.publicAddress || institution.address || 'Address not configured'}
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Contact</h5>
            {contactPhone ? (
              <p className="text-gray-300 text-sm">
                <a href={`tel:${contactPhone}`} className="hover:text-accent transition-colors">
                  {contactPhone}
                </a>
              </p>
            ) : (
              <p className="text-gray-300 text-sm">Phone not configured</p>
            )}
            {contactEmail ? (
              <p className="text-gray-300 text-sm">
                <a href={`mailto:${contactEmail}`} className="hover:text-accent transition-colors">
                  {contactEmail}
                </a>
              </p>
            ) : (
              <p className="text-gray-300 text-sm">Email not configured</p>
            )}
          </div>
          <div>
            <h5 className="font-semibold mb-2">Follow Us</h5>
            <div className="flex space-x-4">
              {(footerData?.sections?.socialMedia || [] as SocialLink[]).map((social: any, index: number) => (
                <a
                  key={index}
                  href={social.href || social.url || '#'}
                  className="text-gray-300 hover:text-accent transition-colors"
                  aria-label={social.name || social.label}
                >
                  {social.iconSvg ? (
                    <span dangerouslySetInnerHTML={{ __html: social.iconSvg }} />
                  ) : (
                    <span className="text-sm">{social.name || social.label}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="border-t border-white/20 mt-8 pt-8 text-center"
        >
          <p className="text-gray-300 text-sm">
            © {currentYear} {institution.name || 'School'}
          </p>
          {Array.isArray(footerData?.sections?.legalLinks) && footerData.sections.legalLinks.length ? (
            <div className="mt-2 space-x-4">
              {footerData.sections.legalLinks
                .filter((link: any) => !!link?.href)
                .map((link: any) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-300 hover:text-accent text-sm transition-colors"
                  >
                    {link.label || link.name}
                  </Link>
                ))}
            </div>
          ) : null}
        </motion.div>
      </div>
    </motion.footer>
  );
}
