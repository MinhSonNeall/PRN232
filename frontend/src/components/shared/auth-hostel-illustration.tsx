/** Right-side illustration panel for auth pages (login/register).
 *  Pure SVG hostel scene with teal gradient backdrop, entrance + ambient animations. */
export function AuthHostelIllustration({ heading, subtitle }: { heading: string; subtitle: string }) {
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-12 text-white animate-slide-right">
      {/* Ambient glows with slow drift */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" style={{ animation: 'gentleDrift 8s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" style={{ animation: 'gentleDrift 10s ease-in-out infinite reverse' }} />

      {/* Hostel building SVG illustration */}
      <svg viewBox="0 0 320 280" fill="none" className="w-72 h-auto drop-shadow-2xl mb-8" aria-hidden="true" style={{ animation: 'float 6s ease-in-out infinite' }}>
        {/* Ground */}
        <rect x="0" y="250" width="320" height="30" rx="8" fill="rgba(255,255,255,0.08)" />

        {/* Main building */}
        <rect x="60" y="70" width="200" height="180" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        {/* Roof */}
        <polygon points="40,75 160,15 280,75" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <circle cx="160" cy="48" r="8" fill="rgba(255,255,255,0.2)" />

        {/* Windows row 1 — animated glow */}
        <rect x="85" y="95" width="30" height="35" rx="3" fill="rgba(251,191,36,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: 'windowGlow 4s ease-in-out infinite' }} />
        <line x1="100" y1="95" x2="100" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="85" y1="112" x2="115" y2="112" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        <rect x="145" y="95" width="30" height="35" rx="3" fill="rgba(251,191,36,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: 'windowGlow 5s ease-in-out infinite 1s' }} />
        <line x1="160" y1="95" x2="160" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="145" y1="112" x2="175" y2="112" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        <rect x="205" y="95" width="30" height="35" rx="3" fill="rgba(251,191,36,0.45)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: 'windowGlow 4.5s ease-in-out infinite 0.5s' }} />
        <line x1="220" y1="95" x2="220" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="205" y1="112" x2="235" y2="112" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* Windows row 2 */}
        <rect x="85" y="150" width="30" height="35" rx="3" fill="rgba(251,191,36,0.5)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: 'windowGlow 5.5s ease-in-out infinite 1.5s' }} />
        <line x1="100" y1="150" x2="100" y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="85" y1="167" x2="115" y2="167" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        <rect x="145" y="150" width="30" height="35" rx="3" fill="rgba(251,191,36,0.35)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: 'windowGlow 4s ease-in-out infinite 2s' }} />
        <line x1="160" y1="150" x2="160" y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="145" y1="167" x2="175" y2="167" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        <rect x="205" y="150" width="30" height="35" rx="3" fill="rgba(251,191,36,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: 'windowGlow 5s ease-in-out infinite 0.8s' }} />
        <line x1="220" y1="150" x2="220" y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="205" y1="167" x2="235" y2="167" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* Door */}
        <rect x="140" y="205" width="40" height="45" rx="4" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <rect x="143" y="208" width="34" height="18" rx="2" fill="rgba(255,255,255,0.1)" />
        <circle cx="170" cy="232" r="2.5" fill="rgba(255,255,255,0.5)" />

        {/* Trees */}
        <ellipse cx="30" cy="225" rx="18" ry="25" fill="rgba(255,255,255,0.08)" />
        <rect x="27" y="240" width="6" height="12" rx="2" fill="rgba(255,255,255,0.1)" />
        <ellipse cx="295" cy="220" rx="20" ry="28" fill="rgba(255,255,255,0.08)" />
        <rect x="292" y="238" width="6" height="14" rx="2" fill="rgba(255,255,255,0.1)" />

        {/* Stars — twinkling */}
        <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.4)" style={{ animation: 'starTwinkle 3s ease-in-out infinite' }} />
        <circle cx="280" cy="20" r="1.5" fill="rgba(255,255,255,0.35)" style={{ animation: 'starTwinkle 4s ease-in-out infinite 1s' }} />
        <circle cx="310" cy="55" r="1.8" fill="rgba(255,255,255,0.3)" style={{ animation: 'starTwinkle 3.5s ease-in-out infinite 0.5s' }} />
        <circle cx="15" cy="60" r="1.2" fill="rgba(255,255,255,0.25)" style={{ animation: 'starTwinkle 5s ease-in-out infinite 2s' }} />

        {/* Moon */}
        <circle cx="270" cy="35" r="12" fill="rgba(255,255,255,0.15)" />
        <circle cx="275" cy="32" r="10" fill="rgba(13,148,136,0.6)" />
      </svg>

      {/* Text content — staggered fade */}
      <h2 className="text-2xl font-bold text-center leading-tight animate-fade-up delay-200">{heading}</h2>
      <p className="mt-3 text-center text-teal-100/80 text-sm max-w-xs leading-relaxed animate-fade-up delay-400">{subtitle}</p>

      {/* Feature pills — staggered entrance */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {['Verified Listings', 'Secure Payments', '24/7 Support'].map((tag, i) => (
          <span
            key={tag}
            className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-sm border border-white/10 animate-fade-up transition-colors hover:bg-white/20"
            style={{ animationDelay: `${0.5 + i * 0.15}s` }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
