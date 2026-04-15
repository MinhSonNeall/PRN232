import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-bold">
                H
              </span>
              <span className="text-lg font-bold text-white tracking-tight">HMSS</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-stone-400 max-w-xs">
              Hotel Management and Search System. Find comfortable rooms that fit your budget and lifestyle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <FooterLink href="/search">Search Rooms</FooterLink>
              <FooterLink href="/register">Create Account</FooterLink>
              <FooterLink href="/login">Sign In</FooterLink>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">For Owners</h3>
            <ul className="space-y-2.5">
              <FooterLink href="/register">List Your Property</FooterLink>
              <FooterLink href="/owner/property">Manage Properties</FooterLink>
              <FooterLink href="/owner/listing">Manage Listings</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                pgb3122003@gmail.com
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                HoaLac, Hanoi, VietNam
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="mx-auto max-w-7xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} HMSS. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-stone-500">
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-stone-400 hover:text-teal-400 transition-colors duration-200"
      >
        {children}
      </Link>
    </li>
  )
}
