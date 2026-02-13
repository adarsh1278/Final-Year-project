'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, ExternalLink, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300">
      {/* Main footer content */}
      <div className="border-t-4 border-yellow-500">
        <div className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-400" />
                GrievEase
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                A Government of India initiative under the Ministry of Electronics & Information Technology, dedicated to efficient, transparent, and accountable public grievance redressal.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">ISO 27001 Certified</span>
                <span className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">GIGW Compliant</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/complaint/register', label: 'File a Grievance' },
                  { href: '/complaint/history', label: 'Complaint History' },
                  { href: '/profile', label: 'My Profile' },
                  { href: '/department/login', label: 'Department Login' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-yellow-300 transition-colors flex items-center gap-1.5 group">
                      <span className="w-1.5 h-1.5 bg-yellow-500/50 rounded-full group-hover:bg-yellow-400 transition-colors"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Links */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4">Important Links</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Terms & Conditions', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Accessibility Statement', href: '#' },
                  { label: 'Copyright Policy', href: '#' },
                  { label: 'Hyperlinking Policy', href: '#' },
                ].map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-400 hover:text-yellow-300 transition-colors flex items-center gap-1.5 group">
                      <span className="w-1.5 h-1.5 bg-yellow-500/50 rounded-full group-hover:bg-yellow-400 transition-colors"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4">Contact Us</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-gray-400">
                    Ministry of Electronics & IT<br />
                    Electronics Niketan, 6, CGO Complex<br />
                    Lodhi Road, New Delhi - 110003
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-yellow-400 shrink-0" />
                  <a href="tel:1800-XXX-XXXX" className="text-gray-400 hover:text-yellow-300 transition-colors">1800-XXX-XXXX (Toll Free)</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-yellow-400 shrink-0" />
                  <a href="mailto:helpdesk@grievease.gov.in" className="text-gray-400 hover:text-yellow-300 transition-colors">helpdesk@grievease.gov.in</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-slate-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Government of India | GrievEase Public Grievance Portal</p>
            <div className="flex items-center gap-4">
              <span>Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              <span className="border-l border-gray-700 h-3"></span>
              <span>Visitors: 12,45,890</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
