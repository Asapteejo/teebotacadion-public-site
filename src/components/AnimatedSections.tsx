// components/AnimatedSections.tsx - Client component with animations
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Panel from '@/components/Panel';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import CtaButton from '@/components/CtaButton';
import ProgramCard from '@/components/ProgramCard';

type Alumnus = {
  name?: string;
  year?: string;
  achievement?: string;
  detail?: string;
};

type AlumniPayload =
  | Alumnus[]
  | {
      data?: Alumnus[];
      alumni?: Alumnus[];
      docs?: Alumnus[];
      results?: Alumnus[];
    }
  | null
  | undefined;

interface AnimatedSectionsProps {
  sections: any;
  testimonials: any[];
  alumni: AlumniPayload;
  exploreItems: any[];
  applyUrl?: string;
  departments?: any[];
  staff?: any[];
  gallery?: any[];
  posts?: any[];
  featuredPrograms?: {
    title: string;
    description: string;
    link: string;
    linkText: string;
    image?: string;
  }[];
}

export default function AnimatedSections({
  sections,
  testimonials,
  alumni,
  exploreItems,
  applyUrl = '',
  departments = [],
  staff = [],
  gallery = [],
  posts = [],
  featuredPrograms = [],
}: AnimatedSectionsProps) {
  const alumniList: Alumnus[] = Array.isArray(alumni)
    ? alumni
    : (alumni as any)?.alumni ||
      (alumni as any)?.data ||
      (alumni as any)?.docs ||
      (alumni as any)?.results ||
      [];
  const hero = sections?.hero || {};
  const heroCtaHref = hero.ctaLink || applyUrl || '/admissions';
  const announcementCtaHref = sections?.announcement?.ctaLink || applyUrl || '';
  const showHero = Boolean(hero.title || hero.text || hero.backgroundImage);
  const showAnnouncement = Boolean(sections?.announcement?.title || sections?.announcement?.text);
  const showPrograms = Boolean(
    (sections?.programs?.list && sections.programs.list.length) ||
      featuredPrograms.length
  );
  const showAlumni = alumniList.length > 0;
  const showAbout = Boolean(sections?.about?.text || sections?.about?.panelTitle);
  const showMission = Boolean(sections?.mission?.text);
  const showAccreditation = Boolean(sections?.accreditation?.text);
  const showCampus = Boolean(sections?.campus?.text);
  const showCampusLife = Boolean(
    sections?.campusLife?.title || sections?.campusLife?.text || sections?.campusLife?.image
      || (Array.isArray(sections?.campusLife?.items) && sections.campusLife.items.length)
  );
  const showTestimonials = Array.isArray(testimonials) && testimonials.length > 0;
  const showDepartments = Array.isArray(departments) && departments.length > 0;
  const showStaff = Array.isArray(staff) && staff.length > 0;
  const showGallery = Array.isArray(gallery) && gallery.length > 0;
  const showNews = Array.isArray(posts) && posts.length > 0;
  const showGive = Boolean(sections?.give?.enabled && (sections?.give?.title || sections?.give?.text));
  const showExplore = Array.isArray(exploreItems) && exploreItems.length > 0;
  const safeFeaturedPrograms = (featuredPrograms || []).filter((program) => !!program?.link);
  const safeSectionPrograms = (sections.programs?.list || [])
    .map((program: any) => ({
      ...program,
      link: program.link || (program.slug ? `/academics/programs/${program.slug}` : program.id ? `/academics/programs/${program.id}` : ''),
    }))
    .filter((program: any) => !!program.link);

  const resolveExploreHref = (item: any) => {
    const rawTitle = String(item?.title || '').toLowerCase();
    const rawLink = String(item?.link || '').trim();

    if (rawTitle.includes('student life')) return '/campus-life';
    if (rawTitle.includes('school news') || rawTitle.includes('news')) return showNews ? '/news' : '/#announcement';
    if (rawLink) return rawLink;

    return '/about';
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hero bg-cover bg-center text-center px-4 py-20 sm:px-6 lg:px-8 text-white min-h-[68vh] md:min-h-[80vh] flex flex-col justify-center relative"
        style={{
          backgroundImage: hero.backgroundImage ? `url(${hero.backgroundImage})` : 'none',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          {showHero ? (
            <>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6">
                {hero.title}
              </h1>
              {hero.text ? (
                <p className="text-base sm:text-lg md:text-2xl mb-8 md:mb-10 max-w-3xl mx-auto px-2">
                  {hero.text}
                </p>
              ) : null}
              {hero.ctaText ? (
                <CtaButton href={heroCtaHref}>{hero.ctaText}</CtaButton>
              ) : null}
            </>
          ) : (
            <p className="text-base sm:text-lg md:text-2xl max-w-3xl mx-auto px-2">
              Homepage hero content is not configured yet.
            </p>
          )}
        </div>
      </motion.section>

      {/* Featured Announcement */}
      {showAnnouncement ? (
        <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        id="announcement"
        className="bg-white py-12 md:py-16"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-primary">
            {sections.announcement?.title}
          </h2>
          {sections.announcement?.text ? (
            <p className="text-lg text-textLight mb-8 max-w-3xl mx-auto">
              {sections.announcement.text}
            </p>
          ) : null}
          {sections.announcement?.ctaText && announcementCtaHref ? (
            <CtaButton href={announcementCtaHref} variant="primary">
              {sections.announcement.ctaText}
            </CtaButton>
          ) : null}
        </div>
      </motion.section>
      ) : null}

      {/* Mission / Accreditation / Campus text blocks */}
      {(showMission || showAccreditation || showCampus) ? (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="bg-white py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
            {showMission ? (
              <div id="mission" className="rounded-lg border border-neutral p-6">
                <h3 className="text-xl md:text-2xl font-serif mb-3">Mission</h3>
                <p className="text-textLight text-sm">{sections.mission.text}</p>
              </div>
            ) : null}
            {showAccreditation ? (
              <div id="accreditation" className="rounded-lg border border-neutral p-6">
                <h3 className="text-xl md:text-2xl font-serif mb-3">Accreditation</h3>
                <p className="text-textLight text-sm">{sections.accreditation.text}</p>
              </div>
            ) : null}
            {showCampus ? (
              <div id="campus" className="rounded-lg border border-neutral p-6">
                <h3 className="text-xl md:text-2xl font-serif mb-3">Campus</h3>
                <p className="text-textLight text-sm">{sections.campus.text}</p>
              </div>
            ) : null}
          </div>
        </motion.section>
      ) : null}

      {/* Program Cards Section */}
      {showPrograms ? (
        <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-neutral py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {sections.programs?.title ? (
              <h2 className="text-3xl md:text-4xl font-serif mb-4">
                {sections.programs?.title}
              </h2>
            ) : null}
            {sections.programs?.description ? (
              <p className="text-lg text-textLight">
                {sections.programs.description}
              </p>
            ) : null}
          </div>

          {safeFeaturedPrograms.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {safeFeaturedPrograms.map((program) => (
                <ProgramCard
                  key={program.link}
                  title={program.title}
                  description={program.description}
                  link={program.link}
                  linkText={program.linkText}
                  image={program.image}
                />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {safeSectionPrograms.map((program: any, index: number) => (
                <ProgramCard
                  key={program.link || program.title || index}
                  title={program.title}
                  description={program.description || program.text}
                  link={program.link}
                  linkText={program.linkText}
                  image={program.image}
                />
              ))}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <CtaButton href="/academics/programs" variant="secondary">
              Show More Programs
            </CtaButton>
          </div>
        </div>
      </motion.section>
      ) : null}

      {/* Alumni Pathways */}
      {showAlumni ? (
        <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {sections.alumni?.title ? (
              <h2 className="text-3xl md:text-4xl font-serif mb-4">
                {sections.alumni?.title}
              </h2>
            ) : null}
            {sections.alumni?.description ? (
              <p className="text-lg text-textLight">
                {sections.alumni.description}
              </p>
            ) : null}
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {alumniList.map((alumniItem, index) => (
              <div
                key={index}
                className="bg-neutral p-6 md:p-8 rounded-lg hover:shadow-medium transition-shadow duration-300"
              >
                <p className="text-sm text-primary font-semibold mb-2">{alumniItem.year}</p>
                <h3 className="text-xl md:text-2xl font-serif mb-3">{alumniItem.name}</h3>
                <p className="font-medium mb-2">{alumniItem.achievement}</p>
                <p className="text-textLight text-sm">{alumniItem.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
      ) : null}

      {/* About Section */}
      {showAbout ? (
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Panel
          id="about"
          title={sections.about?.panelTitle || 'About'}
          description={sections.about?.text || ''}
          link={sections.about?.link}
          linkText={sections.about?.linkText || ''}
        />
      </motion.div>
      ) : null}

      {/* Campus Life Section */}
      {showCampusLife ? (
        <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-neutral py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                {sections.campusLife?.title}
              </h2>
              {sections.campusLife?.text ? (
                <p className="text-lg text-textLight mb-6">
                  {sections.campusLife.text}
                </p>
              ) : null}
              {sections.campusLife?.ctaText ? (
                <CtaButton href="/campus-life" variant="secondary">
                  {sections.campusLife.ctaText}
                </CtaButton>
              ) : null}
            </div>
            <div className="relative h-64 md:h-96 bg-gray-300 rounded-lg overflow-hidden">
              {sections.campusLife?.image ? (
                <Image
                  src={sections.campusLife.image}
                  alt="Campus Life"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-white text-lg">Image not configured</span>
                </div>
              )}
            </div>
          </div>
          {Array.isArray(sections.campusLife?.items) && sections.campusLife.items.length > 0 ? (
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              {sections.campusLife.items.map((item: any, index: number) => (
                <div key={item.id || index} className="bg-white rounded-lg overflow-hidden border border-neutral">
                  <div className="relative h-48 bg-gray-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title || 'Campus life'}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-serif">{item.title || 'Campus Life'}</h4>
                    {item.description ? (
                      <p className="text-sm text-textLight mt-2">{item.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </motion.section>
      ) : null}

      {/* Testimonials */}
      {showTestimonials ? (
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <TestimonialCarousel testimonials={testimonials} />
      </motion.div>
      ) : null}

      {/* Departments */}
      {showDepartments ? (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="bg-white py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">Departments</h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {departments.slice(0, 6).map((item: any, index: number) => (
                <div key={item.id || item.slug || index} className="bg-neutral p-6 rounded-lg">
                  <h3 className="text-xl md:text-2xl font-serif mb-2">{item.name || 'Department'}</h3>
                  {item.description ? (
                    <p className="text-textLight text-sm">{item.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <CtaButton href="/academics/departments" variant="secondary">
                Show More Departments
              </CtaButton>
            </div>
          </div>
        </motion.section>
      ) : null}

      {/* Staff */}
      {showStaff ? (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-neutral py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">Staff</h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {staff.slice(0, 6).map((item: any, index: number) => (
                <div key={item.id || item.email || index} className="bg-white p-6 rounded-lg text-center md:text-left">
                  {item.photoUrl ? (
                    <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden mb-4 bg-gray-100 mx-auto md:mx-0">
                      <Image
                        src={item.photoUrl}
                        alt={item.name || 'Staff'}
                        fill
                        sizes="128px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <h3 className="text-xl font-serif">{item.name || 'Staff Member'}</h3>
                  {item.title ? <p className="text-primary mt-1">{item.title}</p> : null}
                  {item.department ? <p className="text-textLight text-sm mt-1">{item.department}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      ) : null}

      {/* Gallery */}
      {showGallery ? (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="bg-white py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">Gallery</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {gallery.slice(0, 6).map((item: any, index: number) => (
                <div key={item.id || item.imageUrl || index} className="relative h-52 rounded-lg overflow-hidden bg-gray-200">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title || 'Gallery image'}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      ) : null}

      {/* News */}
      {showNews ? (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-neutral py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">News & Updates</h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {posts
                .filter((post: any) => post?.isPublished !== false)
                .slice(0, 6)
                .map((post: any, index: number) => (
                  <Link key={post.id || post.slug || index} href={post.slug ? `/news/${post.slug}` : '/news'} className="bg-white p-6 rounded-lg hover:shadow-medium transition-shadow">
                    <h3 className="text-xl font-serif mb-2">{post.title || 'News'}</h3>
                    {post.excerpt ? <p className="text-textLight text-sm">{post.excerpt}</p> : null}
                  </Link>
                ))}
            </div>
          </div>
        </motion.section>
      ) : null}

      {/* Call to Action - Give */}
      {showGive ? (
        <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-primary text-white py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            {sections.give?.title}
          </h2>
          {sections.give?.text ? (
            <p className="text-base md:text-lg mb-8 opacity-90">
              {sections.give.text}
            </p>
          ) : null}
          {sections.give?.ctaText ? (
            <CtaButton href="/give" variant="light">
              {sections.give.ctaText}
            </CtaButton>
          ) : null}
        </div>
      </motion.section>
      ) : null}

      {/* Explore */}
      {showExplore ? (
        <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sections.explore?.title ? (
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">
              {sections.explore?.title}
            </h2>
          ) : null}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {exploreItems.map((item, index) => (
              <div
                key={index}
                className="bg-neutral p-6 md:p-8 rounded-lg hover:shadow-medium transition-all duration-300 group"
              >
                <h3 className="text-xl md:text-2xl font-serif mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-textLight mb-4">{item.description || item.text}</p>
                <Link
                  href={resolveExploreHref(item)}
                  className="text-accent font-medium hover:underline inline-flex items-center"
                >
                  Learn More
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
      ) : null}
    </>
  );
}
