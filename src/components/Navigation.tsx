'use client'; // ← Required for Framer Motion + existing client-side hooks

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getClientTenantContext } from '@/lib/tenantClient';
type NavigationProps = {
  institution: { name: string; logoUrl?: string; portalUrl?: string };
  menuItems?: MenuGroup[] | { label: string; href: string }[];
  academics?: {
    faculties?: Array<{ id: string; name: string; departments?: Array<{ id: string; name: string }> }>;
    courses?: Array<{ id: string; title: string; code: string; departmentId?: string }>;
  };
};

type MenuItem = {
  name: string;
  href: string;
  openInNewTab?: boolean;
  isExternal?: boolean;
};

type MenuGroup = {
  title?: string;
  label?: string;
  items: MenuItem[];
};

const normalizeMenuHref = (href: string, name: string, groupTitle?: string) => {
  const rawHref = String(href || '').trim();
  const rawName = String(name || '').toLowerCase();
  const rawGroup = String(groupTitle || '').toLowerCase();

  // Fix Admissions -> Fees menu item mapping to the enrollment fees page.
  if (
    rawGroup.includes('admission') &&
    rawName.includes('fee') &&
    (!rawHref || rawHref.includes('/admissions/requirements'))
  ) {
    return '/admissions/fees';
  }

  return rawHref;
};

const normalizeMenuGroups = (groups: MenuGroup[] = []) =>
  groups
    .map((group) => {
      const title = group.title || group.label || '';
      const items = (group.items || [])
        .map((item) => ({
          ...item,
          href: normalizeMenuHref(item?.href, item?.name, title),
        }))
        .filter((item) => !!item?.href);
      return { title, items };
    })
    .filter((group) => group.items.length > 0 && !!group.title);

export default function Navigation({ institution, menuItems: menuItemsProp = [], academics }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileGroups, setOpenMobileGroups] = useState<Record<string, boolean>>({});
  const [menuItems, setMenuItems] = useState<MenuGroup[]>([]); // Dropdown groups
  const [flatItems, setFlatItems] = useState<MenuItem[]>([]);
  const facultyList = Array.isArray(academics?.faculties) ? academics.faculties : [];
  const courseList = Array.isArray(academics?.courses) ? academics.courses : [];
  const portalHref =
    institution.portalUrl ||
    process.env.NEXT_PUBLIC_PORTAL_BASE_URL ||
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    '/portal';

  // Fetch navigation from CMS / published snapshot
  useEffect(() => {
    if (menuItemsProp.length > 0) return;
    const fetchNavigation = async () => {
      try {
        const { host, isLocal, backendBase: base, tenantId, tenantSlug, query, headers } = getClientTenantContext();
        const navUrl = `${base}/public/site/navigation?domain=${encodeURIComponent(host)}`;
        const url = `${base}/public/site${query ? `?${query}` : ''}`;
        const res = await fetch(navUrl, { headers });
        if (res.ok) {
          const data = await res.json();
          const navigation = Array.isArray(data?.navigation) ? data.navigation : [];
          if (navigation.length) {
            if (navigation[0]?.items) {
              const safeGroups = normalizeMenuGroups(navigation as MenuGroup[]);
              setMenuItems(safeGroups);
              setFlatItems([]);
              return;
            }
            setMenuItems([]);
            setFlatItems(
              navigation
                .map((item: any) => ({
                  name: item.label || item.name || 'Link',
                  href: normalizeMenuHref(item.url || item.href, item.label || item.name || 'Link'),
                  openInNewTab: item.openInNewTab,
                  isExternal: item.isExternal,
                }))
                .filter((item: MenuItem) => !!item.href)
            );
            return;
          }
        }

        const snapshotRes = await fetch(url, { headers });
        if (snapshotRes.ok) {
          const data = await snapshotRes.json();
          const navigation =
            data?.settings?.navigation ||
            data?.navigation ||
            data?.menuItems ||
            data?.sections?.menuItems ||
            [];
          if (Array.isArray(navigation) && navigation.length) {
            if (navigation[0]?.items) {
              const safeGroups = (navigation as MenuGroup[])
                .map((group) => ({
                  ...group,
                  items: (group.items || [])
                    .map((item) => ({
                      ...item,
                      href: normalizeMenuHref(item?.href, item?.name, group.title || group.label || ''),
                    }))
                    .filter((item) => !!item?.href),
                }))
                .filter((group) => group.items.length > 0 && !!group.title);
              setMenuItems(safeGroups);
              setFlatItems([]);
              return;
            }
            setMenuItems([]);
            setFlatItems(
              navigation
                .map((item: any) => ({
                  name: item.label || item.name || 'Link',
                  href: normalizeMenuHref(item.url || item.href, item.label || item.name || 'Link'),
                  openInNewTab: item.openInNewTab,
                  isExternal: item.isExternal,
                }))
                .filter((item: MenuItem) => !!item.href)
            );
            return;
          }
        }
        setMenuItems([]);
        setFlatItems([]);
      } catch (error) {
        // Silent fallback on error
        console.error('Failed to fetch navigation from CMS:', error);
      }
    };

    fetchNavigation();
  }, [menuItemsProp]);

  useEffect(() => {
    if (!Array.isArray(menuItemsProp)) return;
    const incoming = menuItemsProp as any[];
    if (incoming.length && incoming[0]?.items) {
      const safeGroups = normalizeMenuGroups(incoming as MenuGroup[]);
      setMenuItems(safeGroups);
      setFlatItems([]);
      return;
    }
    setMenuItems([]);
    setFlatItems(
      incoming
        .map((item: any) => ({
          name: item.label || item.name || 'Link',
          href: normalizeMenuHref(item.href, item.label || item.name || 'Link'),
          openInNewTab: item.openInNewTab,
          isExternal: item.isExternal,
        }))
        .filter((item: MenuItem) => !!item.href)
    );
  }, [menuItemsProp]);

  const toggleMobileGroup = (groupKey: string) => {
    setOpenMobileGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Scroll effect (unchanged)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setOpenMobileGroups({});
    }
  }, [isOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-soft' : 'bg-primary'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo (unchanged) */}
          <Link href="/" className="flex items-center space-x-3 group">
            {institution.logoUrl ? (
              <Image
                src={institution.logoUrl}
                alt={institution.name}
                width={50}
                height={50}
                style={{ height: 'auto' }}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">C</span>
              </div>
            )}
            <span
              className={`font-serif text-xl font-semibold transition-colors duration-300 hidden md:block ${
                scrolled ? 'text-primary' : 'text-white'
              }`}
            >
              {institution.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {flatItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noreferrer' : undefined}
                className={`py-2 font-medium transition-colors duration-300 ${
                  scrolled
                    ? 'text-textDark hover:text-primary'
                    : 'text-white hover:text-accent'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {menuItems.map((menu: MenuGroup) => {
              const menuTitle = menu.title || '';
              return (
              <div
                key={menuTitle}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(menuTitle)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`py-2 font-medium transition-colors duration-300 ${
                    scrolled
                      ? 'text-textDark hover:text-primary'
                      : 'text-white hover:text-accent'
                  }`}
                >
                  {menuTitle}
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute top-full left-0 mt-2 w-56 bg-white shadow-medium rounded-md overflow-hidden transition-all duration-300 ${
                    activeDropdown === menuTitle
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  {menuTitle.toLowerCase() === 'academics' && facultyList.length > 0 ? (
                    <div className="w-[32rem] max-h-[70vh] overflow-auto p-4 grid grid-cols-2 gap-4">
                      <div className="col-span-2 pb-2 border-b border-neutral">
                        <Link href="/academics/faculties" className="text-primary font-semibold hover:underline">
                          View all faculties
                        </Link>
                      </div>
                      {facultyList.slice(0, 10).map((faculty) => (
                        <div key={faculty.id}>
                          <Link href={`/academics/faculties/${faculty.id}`} className="font-semibold text-primary hover:underline">
                            {faculty.name}
                          </Link>
                          <ul className="mt-2 space-y-1">
                            {(faculty.departments || []).slice(0, 6).map((department) => (
                              <li key={department.id}>
                                <Link href={`/academics/departments/${department.id}`} className="text-sm text-textDark hover:text-primary">
                                  {department.name}
                                </Link>
                                <ul className="ml-3 mt-1 space-y-1">
                                  {courseList
                                    .filter((course) => course.departmentId === department.id)
                                    .slice(0, 3)
                                    .map((course) => (
                                      <li key={course.id}>
                                        <Link href={`/academics/courses/${course.id}`} className="text-xs text-textLight hover:text-primary">
                                          {course.code}
                                        </Link>
                                      </li>
                                    ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    menu.items.map((item: MenuItem) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        target={item.openInNewTab ? '_blank' : undefined}
                        rel={item.openInNewTab ? 'noreferrer' : undefined}
                        className="block px-4 py-3 text-textDark hover:bg-neutral hover:text-primary transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
            })}
            <Link
              href={portalHref}
              target="_blank"
              rel="noreferrer"
              className={`ml-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                scrolled
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-accent text-white hover:bg-accent/90'
              }`}
            >
              Student Portal
            </Link>
          </nav>

          {/* Mobile Menu Button (unchanged) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 transition-colors duration-300 ${
              scrolled ? 'text-textDark' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu (unchanged) */}
        <div
          className={`lg:hidden fixed left-0 right-0 top-20 z-40 bg-white border-t border-gray-200 shadow-medium overflow-y-auto transition-all duration-300 ${
            isOpen ? 'max-h-[calc(100vh-5rem)] opacity-100 pb-6' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          {flatItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.openInNewTab ? '_blank' : undefined}
              rel={item.openInNewTab ? 'noreferrer' : undefined}
              className="block py-2 text-textDark hover:text-primary transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {menuItems.map((menu: MenuGroup) => {
            const menuTitle = menu.title || '';
            return (
            <div key={menuTitle} className="border-t border-gray-200 py-3">
              <button
                type="button"
                className="w-full flex items-center justify-between font-semibold text-primary py-1"
                onClick={() => toggleMobileGroup(menuTitle)}
                aria-expanded={Boolean(openMobileGroups[menuTitle])}
              >
                <span>{menuTitle}</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${openMobileGroups[menuTitle] ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 8l4 4 4-4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openMobileGroups[menuTitle] ? 'max-h-[70vh] opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                {menuTitle.toLowerCase() === 'academics' && facultyList.length > 0 ? (
                  <>
                    <Link href="/academics/faculties" className="block py-2 text-textDark hover:text-primary transition-colors duration-200" onClick={() => setIsOpen(false)}>
                      All Faculties
                    </Link>
                    {facultyList.slice(0, 8).map((faculty) => (
                      <div key={faculty.id} className="pl-2">
                        <Link href={`/academics/faculties/${faculty.id}`} className="block py-1 text-sm text-textDark hover:text-primary" onClick={() => setIsOpen(false)}>
                          {faculty.name}
                        </Link>
                        {(faculty.departments || []).slice(0, 4).map((department) => (
                          <Link key={department.id} href={`/academics/departments/${department.id}`} className="block py-1 pl-3 text-xs text-textDark hover:text-primary" onClick={() => setIsOpen(false)}>
                            {department.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </>
                ) : (
                  menu.items.map((item: MenuItem) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noreferrer' : undefined}
                      className="block py-2 text-textDark hover:text-primary transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
          })}
          <Link
            href={portalHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Student Portal
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
