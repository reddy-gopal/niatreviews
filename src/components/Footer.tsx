"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MessageCircle,
  MapPin,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Search Questions", href: "/questions" },
  { label: "Ask a Question", href: "/ask" },
  { label: "Trending FAQs", href: "/questions" },
  { label: "Senior Onboarding", href: "/onboarding/review" },
];

const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Grievance Redressal", href: "/grievance" },
];

const LEGAL_LINKS = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Vision & Values", href: "/vision" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "X", href: "#", icon: Twitter },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "YouTube", href: "#", icon: Youtube },
];

export function Footer() {
  return (
    <>
      <footer
        className="mt-auto w-full"
        style={{ backgroundColor: "var(--hero-from)" }}
        role="contentinfo"
      >
        {/* Top section: 4 columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {/* Column 1: Brand */}
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 w-fit"
                style={{ color: "var(--accent-1)" }}
              >
                <Image
                  src="/logo.png"
                  alt="NIAT"
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
                <span className="text-lg font-bold text-white">
                  NIAT
                </span>
              </Link>
              <p className="text-sm text-gray-200 leading-relaxed max-w-[220px]">
                NxtWave of Innovation in Advanced Technologies
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Quick Link
              </h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ label, href }) => (
                  <li key={href + label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-200 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Reach Us */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Reach Us
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:support@niatindia.com"
                    className="flex items-start gap-2.5 text-sm text-gray-200 hover:text-white transition-colors"
                  >
                    <Mail className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span>support@niatindia.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-start gap-2.5 text-sm text-gray-200 hover:text-white transition-colors"
                  >
                    <MessageCircle
                      className="h-4 w-4 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span>
                      +91 8008 9009 08
                      <span className="block text-gray-300 text-xs">
                        (WhatsApp only)
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Address */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                Address
              </h3>
              <address className="text-sm text-gray-200 leading-relaxed not-italic">
                NIAT
                <br />
                No. 144 Survey 37, Financial District,
                <br />
                Nanakramguda, Telangana 500032
              </address>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          aria-hidden
        />

        {/* Bottom row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left: Social icons */}
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-gray-200 hover:text-white transition-colors p-1"
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </a>
              ))}
            </div>

            {/* Center: Policy links */}
            <nav
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
              aria-label="Policy links"
            >
              {POLICY_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-gray-200 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right: Legal links */}
            <nav
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
              aria-label="Legal links"
            >
              {LEGAL_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-gray-200 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
