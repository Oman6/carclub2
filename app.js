const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

/* ------------------------------------------------------------------ */
/* Content (exact original strings)                                    */
/* ------------------------------------------------------------------ */

const HERO_IMG = 'https://hips.hearstapps.com/autoweek/assets/s3fs-public/car-show11-min.jpg';
const LOGO_IMG = 'images/logo.png';
const BANNER_IMG = 'images/banner.png';
const EMAIL = 'carshow@bryant.edu';
const IG_HANDLE = '@bryantcarclub2026';
const IG_URL = 'https://instagram.com/bryantcarclub2026';
const EVENT_DATE = 'Coming Soon - April 2027';
const ADDRESS_FULL = 'Bryant University Campus, 1150 Douglas Pike, Smithfield, RI 02917';
const ADMISSION = 'Free for Bryant students and staff, $5 general admission';

const schedule = [
  { time: '9:00 AM', event: 'Registration Opens', detail: 'Check-in for registered participants' },
  { time: '10:00 AM', event: 'Gates Open to Public', detail: 'General admission begins' },
  { time: '12:30 PM', event: 'Food & Refreshments', detail: 'Lunch available from local vendors' },
  { time: '3:30 PM', event: 'Event Concludes', detail: 'Thank you for attending' }
];

const categories = [
  { name: 'Classic Cars', description: 'Vehicles manufactured 1900-1979', icon: 'fa-car-side', value: 'classic' },
  { name: 'Muscle Cars', description: 'High-performance American V8 vehicles', icon: 'fa-gauge-high', value: 'muscle' },
  { name: 'Exotic & Luxury', description: 'Premium and rare automobiles', icon: 'fa-gem', value: 'exotic' },
  { name: 'Modern Performance', description: 'Contemporary sports and performance cars', icon: 'fa-bolt', value: 'modern' },
  { name: 'Motorcycles', description: 'Sport bikes, cruisers, and custom motorcycles', icon: 'fa-motorcycle', value: 'motorcycles' },
  { name: 'Custom & Modified', description: 'Customized and modified vehicles', icon: 'fa-wrench', value: 'custom' },
  { name: 'Electric & Alternative', description: 'Electric and alternative fuel vehicles', icon: 'fa-leaf', value: 'electric' }
];

const stats = [
  { display: '150+', value: 150, suffix: '+', label: 'Vehicles Expected' },
  { display: '500+', value: 500, suffix: '+', label: 'Attendees' },
  { display: '7', value: 7, suffix: '', label: 'Vehicle Categories' },
  { display: 'Free', value: null, suffix: '', label: 'For Bryant Students' }
];

const rules = ['Donuts', 'Burnouts', 'Drag Racing', 'Excessive Revving', 'Loud Music', 'Drugs and Alcohol'];

const sponsorLevels = [
  { label: 'Platinum Sponsor', value: 'platinum' },
  { label: 'Gold Sponsor', value: 'gold' },
  { label: 'Silver Sponsor', value: 'silver' },
  { label: 'Bronze Sponsor', value: 'bronze' },
  { label: 'In-Kind Donation', value: 'inkind' },
  { label: 'Other/Discuss', value: 'other' }
];

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'rules', label: 'Rules' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'categories', label: 'Categories' },
  { id: 'sponsors', label: 'Sponsors' }
];

const MENU_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'rules', label: 'Rules' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'categories', label: 'Categories' },
  { id: 'register', label: 'Register' },
  { id: 'sponsors', label: 'Sponsors' }
];

const EMPTY_REG = {
  firstName: '', lastName: '', email: '', phone: '',
  vehicleYear: '', vehicleMake: '', vehicleModel: '',
  category: '', comments: ''
};

const EMPTY_SPONSOR = {
  companyName: '', contactName: '', email: '', phone: '',
  sponsorshipLevel: '', message: ''
};

const pad2 = (n) => String(n).padStart(2, '0');

const REDUCED = typeof window !== 'undefined' && !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const HAS_IO = typeof window !== 'undefined' && 'IntersectionObserver' in window;

/* ------------------------------------------------------------------ */
/* Shared scroll store: one passive listener, rAF-throttled            */
/* ------------------------------------------------------------------ */

const scrollStore = (() => {
  const subs = new Set();
  let state = { y: 0, progress: 0, vh: typeof window !== 'undefined' ? window.innerHeight : 800 };
  let ticking = false;
  let bound = false;

  const compute = () => {
    ticking = false;
    const y = window.scrollY || window.pageYOffset || 0;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    state = { y, vh, progress: max > 0 ? Math.min(1, Math.max(0, y / max)) : 0 };
    subs.forEach((fn) => fn(state));
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(compute);
    }
  };

  return {
    subscribe(fn) {
      if (!bound) {
        bound = true;
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        window.addEventListener('load', request);
      }
      subs.add(fn);
      request();
      return () => subs.delete(fn);
    }
  };
})();

function useScroll(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => scrollStore.subscribe((s) => ref.current(s)), []);
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

function useInView(ref, { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } = {}) {
  const [inView, setInView] = useState(!HAS_IO);

  useEffect(() => {
    const el = ref.current;
    if (!el || (inView && once)) return undefined;
    let seen = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          seen = true;
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      });
    }, { threshold, rootMargin });
    io.observe(el);

    // Failsafe: if the observer misfires, never leave on-screen (or passed) content hidden.
    const t = setTimeout(() => {
      if (seen) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) setInView(true);
    }, 2500);

    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [inView]);

  return inView;
}

function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  const [formsVisible, setFormsVisible] = useState(false);

  useEffect(() => {
    if (!HAS_IO) return undefined;
    const els = ['top'].concat(ids).map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id === 'top' ? null : entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));

    const visible = new Set();
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      setFormsVisible(visible.size > 0);
    }, { threshold: 0 });
    ['register', 'sponsors'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io2.observe(el);
    });

    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  return { active, formsVisible };
}

function useSubmitFlow(onReset) {
  const [status, setStatus] = useState('idle'); // idle | submitting | done
  const statusRef = useRef('idle');
  const timers = useRef([]);
  const resetRef = useRef(onReset);
  resetRef.current = onReset;

  const set = (v) => {
    statusRef.current = v;
    setStatus(v);
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const submit = (e) => {
    e.preventDefault();
    if (statusRef.current !== 'idle') return;
    set('submitting');
    timers.current.push(setTimeout(() => {
      set('done');
      timers.current.push(setTimeout(() => {
        resetRef.current();
        set('idle');
      }, 3000));
    }, 600));
  };

  // Finish a pending submission immediately (clear the form, return to idle).
  const finishNow = () => {
    if (statusRef.current === 'idle') return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    resetRef.current();
    set('idle');
  };

  return [status, submit, finishNow];
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function SafeImg({ src, alt, className = '', fallback = null, onFail, ...rest }) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;
  const fail = () => {
    setFailed(true);
    if (onFail) onFail();
  };
  return <img src={src} alt={alt} className={className} onError={fail} {...rest} />;
}

function Monogram({ size = 40 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex flex-none items-center justify-center rounded-full border border-bryant-gold-light bg-black font-display font-semibold text-bryant-gold-light"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45), lineHeight: 1 }}
    >
      B
    </span>
  );
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Eyebrow({ index, children, tone = 'dark', className = '' }) {
  const color = tone === 'light' ? 'text-bryant-gold-deep' : 'text-bryant-gold-light';
  return (
    <p className={`t-eyebrow ${color} ${className}`}>
      {index} <span aria-hidden="true">—</span> {children}
    </p>
  );
}

function ArrowIcon({ className = '' }) {
  return <i className={`fa-solid fa-arrow-right arrow text-[12px] ${className}`} aria-hidden="true"></i>;
}

function Field({ id, label, required = false, textarea = false, errMsg, className = '', ...input }) {
  const errId = `${id}-err`;
  const Comp = textarea ? 'textarea' : 'input';
  return (
    <div className={`field-wrap ${className}`}>
      <label htmlFor={id} className="f-label">
        {label}
        {required && (
          <React.Fragment>
            <span className="text-bryant-gold-deep" aria-hidden="true">&nbsp;*</span>
            <span className="sr-only"> (required)</span>
          </React.Fragment>
        )}
      </label>
      <Comp
        id={id}
        required={required}
        aria-describedby={required ? errId : undefined}
        className={`field ${textarea ? 'field-area' : ''}`}
        {...input}
      />
      {required && <p className="err" id={errId}>{errMsg || 'Please fill out this field.'}</p>}
    </div>
  );
}

function RadioCard({ name, value, label, icon, checked, onChange, onDeselect, describedBy, required = false, flashKey = null }) {
  return (
    <label className={`radio-card ${checked ? 'is-checked' : ''}`}>
      {flashKey !== null && <span key={flashKey} className="flash-layer" aria-hidden="true"></span>}
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        onClick={onDeselect && checked ? onDeselect : undefined}
        required={required}
        aria-describedby={describedBy}
      />
      <span className="rc-content flex min-w-0 items-center gap-3">
        {icon && (
          <i
            className={`fa-solid ${icon} w-5 flex-none text-center text-[15px] ${checked ? 'text-bryant-gold' : 'text-bryant-stone'}`}
            aria-hidden="true"
          ></i>
        )}
        <span className="min-w-0">{label}</span>
      </span>
      <i
        className={`rc-content fa-solid fa-circle-check flex-none text-bryant-gold transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      ></i>
    </label>
  );
}

function FieldsetLegend({ children }) {
  return <legend className="t-eyebrow mb-6 p-0 text-bryant-gold-deep">{children}</legend>;
}

function SubmitButton({ status, label, busyLabel = 'Submitting' }) {
  const busy = status === 'submitting';
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy ? 'true' : 'false'}
      className="btn btn-black mt-12 h-14 w-full"
    >
      {busy ? (
        <React.Fragment>
          <i className="fa-solid fa-spinner fa-spin text-[14px]" aria-hidden="true"></i>
          {busyLabel}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {label}
          <ArrowIcon />
        </React.Fragment>
      )}
    </button>
  );
}

function SuccessState({ title, body }) {
  const headingRef = useRef(null);
  useEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, []);
  return (
    <div role="status" aria-live="polite" className="success-in flex min-h-[560px] flex-col items-center justify-center text-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle className="check-circle" cx="32" cy="32" r="30" stroke="#826E38" strokeWidth="2" />
        <path className="check-mark" d="M21 33 L29 41 L44 25" stroke="#826E38" strokeWidth="2" strokeLinecap="square" />
      </svg>
      <h3 ref={headingRef} tabIndex={-1} className="t-h3 mt-6 text-bryant-ink focus:outline-none">{title}</h3>
      <p className="mt-3 max-w-[40ch] text-[17px] text-bryant-stone">{body}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chrome: skip link, progress, nav, mobile menu                       */
/* ------------------------------------------------------------------ */

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:inline-flex focus:h-10 focus:items-center focus:rounded-full focus:bg-bryant-gold focus:px-4 focus:text-[14px] focus:font-semibold focus:text-white"
    >
      Skip to content
    </a>
  );
}

function ScrollProgress() {
  const ref = useRef(null);
  useScroll(({ progress }) => {
    if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
  });
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-bryant-gold"
      style={{ transform: 'scaleX(0)' }}
    ></div>
  );
}

function BrandLockup({ size = 40, sub = 'Car Show 2027', lazy = false }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex flex-none items-center justify-center" style={{ width: size, height: size }}>
        <SafeImg
          src={LOGO_IMG}
          alt="Bryant Car Club logo"
          width={size}
          height={size}
          loading={lazy ? 'lazy' : undefined}
          decoding="async"
          className="h-full w-full object-contain"
          fallback={<Monogram size={size} />}
        />
      </span>
      <span className="block min-w-0 whitespace-nowrap leading-none">
        <span className="block font-display text-[15px] font-semibold tracking-[-0.01em] text-white">Bryant University</span>
        <span className="mt-1.5 block font-mono text-[12px] uppercase tracking-[.12em] text-bryant-gold-light sm:text-[12px]">{sub}</span>
      </span>
    </span>
  );
}

function Nav({ active, menuOpen, onToggle, toggleRef }) {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  useScroll(({ y }) => {
    const s = y > 24;
    if (s !== scrolledRef.current) {
      scrolledRef.current = s;
      setScrolled(s);
    }
  });
  const solid = scrolled && !menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b transition-[background-color,border-color] duration-300 ease-snap md:h-20 ${
        solid ? 'border-white/10 bg-black/95 backdrop-blur-sm' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="wrap flex h-full items-center justify-between gap-4">
        <a id="brand-home" href="#top" className="flex min-h-[44px] min-w-0 shrink items-center" aria-label="Bryant University Car Show 2027, back to top">
          <BrandLockup />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-5 md:flex lg:gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="nav-link py-2 text-[14px] font-medium"
              aria-current={active === link.id ? 'true' : undefined}
            >
              {link.label}
              <span className="nav-u" aria-hidden="true"></span>
            </a>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2 md:gap-6">
          <a href="#register" className="btn btn-gold hidden h-10 px-4 text-[14px] min-[380px]:inline-flex md:px-5">
            Register
            <ArrowIcon />
          </a>
          <button
            ref={toggleRef}
            type="button"
            onClick={onToggle}
            aria-expanded={menuOpen ? 'true' : 'false'}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-white md:hidden"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-[20px]`} aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose, toggleRef }) {
  const menuRef = useRef(null);
  const firstRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    if (firstRef.current) firstRef.current.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const onBlur = (e) => {
    const next = e.relatedTarget;
    if (next && menuRef.current && !menuRef.current.contains(next) && next !== toggleRef.current) {
      onClose(false);
    }
  };

  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      onBlur={onBlur}
      className="menu-in fixed inset-0 z-40 flex flex-col overflow-y-auto bg-black px-4 pb-10 pt-24 md:hidden"
    >
      <nav aria-label="Mobile">
        <ul>
          {MENU_LINKS.map((link, i) => (
            <li key={link.id} className="menu-item border-b border-white/10" style={{ animationDelay: `${60 + i * 40}ms` }}>
              <a
                ref={i === 0 ? firstRef : undefined}
                href={`#${link.id}`}
                onClick={() => onClose(false)}
                className="flex items-baseline gap-4 py-4"
              >
                <span className="font-mono text-[12px] tracking-[.14em] text-bryant-gold-light">{pad2(i + 1)}</span>
                <span className="font-display text-[40px] font-semibold leading-none tracking-[-0.03em] text-white">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="menu-item mt-auto pt-10" style={{ animationDelay: `${60 + MENU_LINKS.length * 40}ms` }}>
        <p className="font-mono text-[12px] leading-relaxed tracking-[.08em] text-bryant-mist">
          Bryant University Campus · 1150 Douglas Pike, Smithfield, RI 02917
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6">
          <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 text-[15px] text-white">
            <i className="fa-brands fa-instagram text-bryant-gold-light" aria-hidden="true"></i>
            {IG_HANDLE}
          </a>
          <a href={`mailto:${EMAIL}`} className="inline-flex min-h-[44px] items-center gap-2 text-[15px] text-white">
            <i className="fa-solid fa-envelope text-bryant-gold-light" aria-hidden="true"></i>
            {EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero + spec strip                                                   */
/* ------------------------------------------------------------------ */

function Hero() {
  const mediaRef = useRef(null);
  const contentRef = useRef(null);
  const [imgOk, setImgOk] = useState(true);

  useScroll(({ y, vh }) => {
    if (REDUCED || y > vh * 1.2) return;
    if (mediaRef.current) mediaRef.current.style.transform = `translate3d(0, ${(y * 0.25).toFixed(1)}px, 0)`;
    if (contentRef.current) contentRef.current.style.opacity = String(1 - Math.min(y / vh, 1) * 0.6);
  });

  const readout = [
    { k: 'Date', v: EVENT_DATE },
    { k: 'Location', v: 'Bryant University Campus, Smithfield, RI' },
    { k: 'Admission', v: 'Free for Bryant students & staff · $5 general' }
  ];

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate min-h-[640px] overflow-hidden"
      style={{ minHeight: 'max(640px, 100svh)', background: '#0A0A0A radial-gradient(ellipse 80% 60% at 70% 30%, #1a1712 0%, #000 70%)' }}
    >
      <div ref={mediaRef} className="absolute inset-0 -z-10 will-change-transform" aria-hidden={!imgOk ? 'true' : undefined}>
        <div className="absolute inset-0 overflow-hidden">
          {imgOk && (
            <img
              src={HERO_IMG}
              alt="Classic cars displayed on university campus lawn"
              className="hero-img h-full w-full object-cover"
              fetchpriority="high"
              decoding="async"
              onError={() => setImgOk(false)}
            />
          )}
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,.6) 40%, rgba(0,0,0,.15) 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.6) 0%, transparent 65%)' }}></div>
      </div>

      <div ref={contentRef} className="wrap relative flex flex-col justify-end pb-14 pt-32 md:pb-20" style={{ minHeight: 'max(640px, 100svh)' }}>
        <div className="fade-up" style={{ animationDelay: '0ms' }}>
          <span className="inline-flex min-h-8 max-w-full items-center gap-2.5 rounded-full border border-[rgba(179,154,90,.4)] bg-[rgba(130,110,56,.12)] px-3 py-1.5">
            <span className="pulse-dot h-1.5 w-1.5 flex-none rounded-full bg-bryant-gold-light" aria-hidden="true"></span>
            <span className="font-mono text-[12px] font-medium uppercase leading-tight tracking-[.1em] text-bryant-gold-light sm:text-[12px] sm:tracking-[.12em]">
              <span className="hidden min-[360px]:inline">Annual Event · </span>{EVENT_DATE}
            </span>
          </span>
        </div>

        <h1 id="hero-title" className="t-h1 mt-6 text-white">
          <span className="line-mask">
            <span className="rise" style={{ animationDelay: '150ms' }}>Bryant University</span>
          </span>{' '}
          <span className="line-mask">
            <span className="rise" style={{ animationDelay: '270ms' }}>
              Car Show <span className="serif-accent text-bryant-gold-light">2027</span>
            </span>
          </span>
        </h1>

        <p className="t-lead fade-up mt-6 max-w-[40ch] text-bryant-mist" style={{ animationDelay: '450ms' }}>
          Join the Bryant community for our premier automotive showcase, a day celebrating automotive design, engineering, and the passion that drives us forward.
        </p>

        <div className="fade-up mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ animationDelay: '560ms' }}>
          <a href="#register" className="btn btn-gold h-14 px-8">
            Register your vehicle
            <ArrowIcon />
          </a>
          <a href="#sponsors" className="btn btn-ghost h-14 px-8">
            Become a sponsor
          </a>
          <a href="#schedule" className="u-link mt-2 min-h-[44px] gap-2 self-start text-[15px] font-medium text-bryant-mist transition-colors duration-200 hover:text-white sm:ml-4 sm:mt-0 sm:self-center">
            View schedule
            <i className="fa-solid fa-chevron-down text-[12px]" aria-hidden="true"></i>
          </a>
        </div>

        <dl className="fade-up mt-14 grid grid-cols-1 gap-y-5 border-t border-white/10 pt-6 md:grid-cols-3 md:divide-x md:divide-white/10" style={{ animationDelay: '680ms' }}>
          {readout.map((item, i) => (
            <div key={item.k} className={i === 0 ? 'md:pr-6' : 'md:px-6'}>
              <dt className="font-mono text-[12px] uppercase tracking-[.14em] text-bryant-mist">{item.k}</dt>
              <dd className="mt-1.5 font-display text-[17px] font-medium leading-snug text-white">{item.v}</dd>
            </div>
          ))}
        </dl>

      </div>
    </section>
  );
}

function CountUp({ to, run }) {
  const animate = !REDUCED && HAS_IO;
  const [v, setV] = useState(animate ? 0 : to);

  useEffect(() => {
    if (!run || !animate) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setV(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);

  return (
    <span className="inline-block tabular-nums" style={{ minWidth: `${String(to).length}ch` }}>
      {v}
    </span>
  );
}

function StatCell({ stat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.3 });
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} bg-black px-6 py-12 md:py-16`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <p className="sr-only">{stat.display} {stat.label}</p>
      <div aria-hidden="true">
        <div className="t-stat text-white">
          {stat.value !== null ? <CountUp to={stat.value} run={inView} /> : stat.display}
          {stat.suffix && <span className="text-bryant-gold-light">{stat.suffix}</span>}
        </div>
        <span className="draw-x mt-6 block h-px w-8 bg-bryant-gold"></span>
        <p className="mt-4 font-mono text-[12px] uppercase tracking-[.14em] text-bryant-mist">{stat.label}</p>
      </div>
    </div>
  );
}

function SpecStrip() {
  return (
    <section aria-label="Event at a glance" className="border-y border-white/10 bg-black">
      <div className="wrap !px-0 sm:!px-8 lg:!px-12">
        <div className="grid grid-cols-2 gap-px bg-white/10 sm:border-x sm:border-white/10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCell key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

function BannerFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-bryant-carbon" role="img" aria-label="Bryant University Car Club">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${HERO_IMG}")`, filter: 'grayscale(1) contrast(1.1) brightness(.8)' }}
        aria-hidden="true"
      ></div>
      <div className="absolute inset-0 bg-bryant-gold mix-blend-multiply" aria-hidden="true"></div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.2) 100%)' }} aria-hidden="true"></div>
      <span className="absolute inset-4 border border-[rgba(217,201,160,.3)] md:inset-6" aria-hidden="true"></span>
      <div className="relative flex h-full flex-col justify-end gap-5 p-8 md:flex-row md:items-end md:justify-start md:gap-8 md:p-14" aria-hidden="true">
        <span className="hidden sm:block"><Monogram size={88} /></span>
        <span className="sm:hidden"><Monogram size={56} /></span>
        <span className="block leading-none">
          <span className="block font-display text-[32px] font-semibold tracking-[-0.03em] text-white md:text-[56px]">Bryant University</span>
          <span className="mt-3 block font-mono text-[12px] uppercase tracking-[.16em] text-bryant-gold-pale md:text-[13px]">Car Club · Car Show 2027</span>
        </span>
      </div>
    </div>
  );
}

function Banner() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [failed, setFailed] = useState(false);
  return (
    <figure ref={ref} className={`reveal ${inView ? 'is-in' : ''} mt-16 md:mt-24`}>
      <div className={`relative overflow-hidden border border-bryant-line-light bg-bryant-carbon ${failed ? 'aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/6]' : 'aspect-[4/3] md:aspect-[16/7]'}`}>
        <SafeImg
          src={BANNER_IMG}
          alt="Bryant University Car Club banner featuring classic muscle car, exotic supercar, and modern sports car"
          loading="lazy"
          decoding="async"
          className={`banner-img ${inView ? 'is-in' : ''} absolute inset-0 h-full w-full object-cover`}
          fallback={<BannerFallback />}
          onFail={() => setFailed(true)}
        />
      </div>
      {!failed && (
        <figcaption className="mt-3 font-mono text-[12px] tracking-[.08em] text-bryant-stone">
          Fig. 01 — Bryant University Car Club
        </figcaption>
      )}
    </figure>
  );
}

function About() {
  const facts = [
    { k: 'Date', v: EVENT_DATE },
    { k: 'Location', v: ADDRESS_FULL },
    { k: 'Admission', v: ADMISSION }
  ];
  return (
    <section id="about" aria-labelledby="about-title" className="on-light bg-bryant-bone py-24 text-bryant-ink md:py-40">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="self-start lg:sticky lg:top-28 lg:col-span-5">
            <Eyebrow index="01" tone="light">About the Event</Eyebrow>
            <h2 id="about-title" className="t-h2 mt-6 text-bryant-ink">A celebration of automotive innovation.</h2>
          </Reveal>
          <div className="space-y-6 text-[18px] leading-[1.65] lg:col-span-6 lg:col-start-7 lg:pt-10">
            <Reveal as="p" className="prose-62 text-bryant-ink">
              The Bryant University Car Show brings together automotive enthusiasts, students, alumni, and the local community for a day of celebration and appreciation of automotive design, engineering, and culture.
            </Reveal>
            <Reveal as="p" delay={80} className="prose-62 text-bryant-stone">
              This event reflects Bryant's commitment to innovation, excellence, and community engagement. Whether you're a collector, restorer, student, or simply appreciate fine automobiles, this showcase offers something for everyone.
            </Reveal>
          </div>
        </div>

        <Banner />

        <Reveal>
          <dl className="mt-12 grid grid-cols-1 gap-8 border-t border-bryant-line-light pt-8 md:grid-cols-3">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="font-mono text-[12px] uppercase tracking-[.14em] text-bryant-gold-deep">{f.k}</dt>
                <dd className="mt-2 font-display text-[20px] font-medium leading-snug tracking-[-0.01em] text-bryant-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ground rules                                                        */
/* ------------------------------------------------------------------ */

function GroundRules() {
  return (
    <section id="rules" aria-labelledby="rules-title" className="bg-black py-24 text-white md:py-40">
      <div className="wrap">
        <Reveal className="max-w-[900px]">
          <Eyebrow index="02">Event Ground Rules</Eyebrow>
          <h2 id="rules-title" className="t-h2 mt-6 text-white">
            Drive <span className="serif-accent text-bryant-gold-light">slow.</span> Be aware of your surroundings.
          </h2>
          <p className="t-lead mt-6 text-bryant-mist">
            We are expecting hundreds of people to attend the show, so it is crucial to drive slow and be aware of your surroundings.
          </p>
        </Reveal>

        <Reveal as="p" className="mt-14 font-display font-semibold uppercase leading-tight tracking-[.02em] text-white" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)' }}>
          We will not tolerate reckless or obnoxious behavior.
        </Reveal>

        <ul aria-label="Prohibited behavior" className="mt-8 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule, i) => (
            <Reveal as="li" key={rule} delay={i * 60} className="bg-black">
              <div className="rule-cell flex min-h-[72px] items-center gap-4 px-5 py-4 sm:min-h-[168px] sm:flex-col sm:items-stretch sm:justify-between sm:gap-0 sm:p-8">
                <div className="contents sm:flex sm:items-center sm:justify-between">
                  <span className="order-1 w-6 flex-none font-mono text-[12px] tracking-[.14em] text-bryant-gold-light sm:w-auto">{pad2(i + 1)}</span>
                  <i className="fa-solid fa-ban order-3 ml-auto flex-none text-[18px] text-bryant-gold-light sm:ml-0" aria-hidden="true"></i>
                </div>
                <span className="relative order-2 inline-block self-center font-display text-[20px] font-medium leading-tight tracking-[-0.015em] text-white sm:order-none sm:mt-8 sm:self-start sm:text-[24px]">
                  {rule}
                  <span className="strike" aria-hidden="true"></span>
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal role="note" className="mt-8 flex items-start gap-4 border-l-2 border-bryant-gold-light bg-bryant-carbon p-6 md:p-8">
          <span className="mt-2.5 h-2 w-2 flex-none rounded-full bg-bryant-signal" aria-hidden="true"></span>
          <p className="text-[18px] font-semibold leading-snug text-white md:text-[20px]">
            If you are seen conducting any of this behavior, you will be asked to leave IMMEDIATELY!
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Image band                                                          */
/* ------------------------------------------------------------------ */

function ImageBand() {
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);
  const [imgOk, setImgOk] = useState(true);

  useScroll(({ vh }) => {
    if (REDUCED) return;
    const el = sectionRef.current;
    if (!el || !mediaRef.current) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1 around center
    mediaRef.current.style.transform = `translate3d(0, ${(p * -60).toFixed(1)}px, 0)`;
  });

  return (
    <section ref={sectionRef} aria-label="Bryant University Campus" className="relative isolate flex min-h-[60vh] items-end overflow-hidden bg-bryant-carbon" style={{ minHeight: 'max(420px, 60svh)' }}>
      <div ref={mediaRef} className="absolute inset-x-0 -bottom-20 -top-20 -z-10 will-change-transform" aria-hidden="true">
        {imgOk && (
          <img
            src={HERO_IMG}
            alt=""
            loading="lazy"
            decoding="async"
            className="band-img h-full w-full object-cover"
            onError={() => setImgOk(false)}
          />
        )}
      </div>
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 45%, rgba(0,0,0,.35) 100%)' }} aria-hidden="true"></div>
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.25) 60%, transparent 100%)' }} aria-hidden="true"></div>
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden="true"></div>
      <div className="wrap relative py-16 md:py-24">
        <Reveal>
          <p className="t-eyebrow text-bryant-gold-light">Bryant University Campus <span aria-hidden="true">·</span> Smithfield, RI</p>
          <p className="t-h2 mt-6 max-w-[16ch] text-white">
            Design, engineering, and the <span className="serif-accent text-bryant-gold-light">passion</span> that drives us.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Schedule                                                            */
/* ------------------------------------------------------------------ */

function Schedule() {
  const olRef = useRef(null);
  const fillRef = useRef(null);
  const nodeRefs = useRef([]);

  useScroll(({ vh }) => {
    const ol = olRef.current;
    if (!ol || !fillRef.current) return;
    const r = ol.getBoundingClientRect();
    if (r.height <= 0) return;
    const p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
    fillRef.current.style.transform = `scaleY(${p})`;
    const filled = 8 + p * (r.height - 16);
    nodeRefs.current.forEach((node) => {
      if (!node || !node.parentElement) return;
      const center = node.parentElement.offsetTop + 42 + 7;
      node.classList.toggle('is-lit', filled >= center);
    });
  });

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="on-light bg-white py-24 text-bryant-ink md:py-40">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="self-start lg:sticky lg:top-28 lg:col-span-5">
            <Eyebrow index="03" tone="light">Event Timeline</Eyebrow>
            <h2 id="schedule-title" className="t-h2 mt-6 text-bryant-ink">Schedule of events.</h2>
            <p className="t-time mt-4 text-bryant-gold-deep">{EVENT_DATE}</p>
          </Reveal>

          <ol ref={olRef} className="relative pl-10 lg:col-span-7">
            <span className="absolute bottom-2 left-[7px] top-2 w-px bg-bryant-line-light" aria-hidden="true"></span>
            <span ref={fillRef} className="tl-fill absolute bottom-2 left-[7px] top-2 w-px bg-bryant-gold" aria-hidden="true"></span>
            {schedule.map((item, i) => (
              <li key={item.time} className={`tl-row relative py-8 ${i < schedule.length - 1 ? 'border-b border-bryant-line-light' : ''}`}>
                <span
                  ref={(el) => (nodeRefs.current[i] = el)}
                  className="tl-node absolute left-[-40px] top-[42px] h-[15px] w-[15px] rounded-full"
                  aria-hidden="true"
                ></span>
                <Reveal delay={i * 60}>
                  <time className="t-time block text-bryant-gold-deep">{item.time}</time>
                  <h3 className="tl-name mt-2 font-display font-medium leading-[1.1] tracking-[-0.025em] text-bryant-ink" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                    {item.event}
                  </h3>
                  <p className="mt-2 text-[16px] text-bryant-stone">{item.detail}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

function Categories({ onPick }) {
  return (
    <section id="categories" aria-labelledby="categories-title" className="bg-black py-24 text-white md:py-40">
      <div className="wrap">
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[820px]">
            <Eyebrow index="04">Vehicle Showcase</Eyebrow>
            <h2 id="categories-title" className="t-h2 mt-6 text-white">Seven categories. Every kind of enthusiast.</h2>
          </div>
          <p className="text-[17px] leading-relaxed text-bryant-mist md:max-w-[36ch]">
            Vehicles will be displayed across seven distinct categories, celebrating diversity in automotive excellence.
          </p>
        </Reveal>

        <ul className="mt-14 border-b border-white/10">
          {categories.map((c, i) => (
            <li key={c.value}>
              <Reveal delay={i * 60}>
                <button
                  type="button"
                  onClick={() => onPick(c.value)}
                  className="cat-row group relative grid w-full grid-cols-[48px_1fr] items-center gap-x-4 border-t border-white/10 py-7 text-left md:grid-cols-[80px_1fr_minmax(0,30ch)_56px] md:gap-x-8 md:py-9"
                >
                  <span className="self-start pt-[0.6em] font-mono text-[13px] tracking-[.08em] text-bryant-gold-light md:self-center md:pt-0" aria-hidden="true">{pad2(i + 1)}</span>
                  <span className="block min-w-0">
                    <span className="sr-only">Register a vehicle in </span>
                    <span className="cat-name block font-display font-medium leading-[1.05] tracking-[-0.03em]" style={{ fontSize: 'clamp(1.75rem, 4.2vw, 3.5rem)' }}>
                      {c.name}
                    </span>
                    <span className="cat-hint mt-3 hidden font-mono text-[12px] uppercase tracking-[.14em] text-bryant-gold-light md:block" aria-hidden="true">
                      Register in this category →
                    </span>
                  </span>
                  <span className="col-start-2 mt-2 text-[15px] leading-snug text-bryant-mist md:col-start-auto md:mt-0">{c.description}</span>
                  <span className="cat-icons hidden items-center justify-end gap-3 text-[16px] text-bryant-gold-light md:flex" aria-hidden="true">
                    <i className={`fa-solid ${c.icon}`}></i>
                    <i className="fa-solid fa-arrow-right text-[13px]"></i>
                  </span>
                  <span className="cat-sweep absolute bottom-[-1px] left-0 h-px w-full bg-bryant-gold" aria-hidden="true"></span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Register                                                            */
/* ------------------------------------------------------------------ */

function FormCard({ children, minH = 'min-h-[640px]' }) {
  return (
    <Reveal className={`border border-bryant-line-light bg-white p-6 sm:p-10 ${minH}`}>
      {children}
    </Reveal>
  );
}

function Register({ data, setData, flash, finishRef }) {
  const formRef = useRef(null);
  const wasDone = useRef(false);
  const [status, submit, finishNow] = useSubmitFlow(() => setData(EMPTY_REG));
  if (finishRef) finishRef.current = finishNow;

  useEffect(() => {
    if (status === 'done') wasDone.current = true;
    if (status === 'idle' && wasDone.current) {
      wasDone.current = false;
      const active = document.activeElement;
      if (!active || active === document.body) {
        const first = document.getElementById('reg-firstName');
        if (first) first.focus({ preventScroll: true });
      }
    }
  }, [status]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const steps = [
    { n: '01', label: 'Driver', done: !!(data.firstName && data.lastName && data.email) },
    { n: '02', label: 'Vehicle', done: !!(data.vehicleYear && data.vehicleMake && data.vehicleModel) },
    { n: '03', label: 'Category', done: !!data.category }
  ];

  return (
    <section id="register" aria-labelledby="register-title" className="on-light bg-bryant-bone py-24 text-bryant-ink md:py-40">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="self-start lg:sticky lg:top-28 lg:col-span-5">
            <Eyebrow index="05" tone="light">Join the Show</Eyebrow>
            <h2 id="register-title" className="t-h2 mt-6 text-bryant-ink">Vehicle registration.</h2>
            <p className="mt-6 max-w-[40ch] text-[18px] leading-relaxed text-bryant-stone">
              Register your vehicle to be part of this premier automotive showcase.
            </p>

            <ol className="mt-10 border-b border-bryant-line-light" aria-label="Registration progress">
              {steps.map((s) => (
                <li key={s.n} className="flex items-center gap-4 border-t border-bryant-line-light py-4">
                  <span className="font-mono text-[12px] tracking-[.14em] text-bryant-gold-deep">{s.n}</span>
                  <span className={`flex-1 text-[15px] font-medium transition-colors duration-200 ${s.done ? 'text-bryant-ink' : 'text-bryant-stone'}`}>{s.label}</span>
                  {s.done ? (
                    <React.Fragment>
                      <i className="fa-solid fa-check text-[14px] text-bryant-gold" aria-hidden="true"></i>
                      <span className="sr-only">complete</span>
                    </React.Fragment>
                  ) : (
                    <span className="h-[14px] w-[14px] rounded-full border border-bryant-control-line" aria-hidden="true"></span>
                  )}
                </li>
              ))}
            </ol>

            <dl className="mt-10 space-y-5">
              <div>
                <dt className="font-mono text-[12px] uppercase tracking-[.14em] text-bryant-gold-deep">Registration Opens</dt>
                <dd className="mt-1 text-[15px] text-bryant-ink">9:00 AM</dd>
              </div>
            </dl>
          </Reveal>

          <div className="lg:col-span-7">
            <FormCard>
              {status === 'done' ? (
                <SuccessState
                  title="Registration Submitted!"
                  body="Thank you for registering. We'll be in touch soon with more details."
                />
              ) : (
                <form ref={formRef} onSubmit={submit} aria-labelledby="register-title">
                  <fieldset className="m-0 border-0 p-0">
                    <FieldsetLegend>01 — Driver</FieldsetLegend>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                      <Field id="reg-firstName" name="firstName" label="First Name" required autoComplete="given-name" value={data.firstName} onChange={onChange} />
                      <Field id="reg-lastName" name="lastName" label="Last Name" required autoComplete="family-name" value={data.lastName} onChange={onChange} />
                      <Field id="reg-email" name="email" type="email" label="Email" required autoComplete="email" errMsg="Please enter a valid email." value={data.email} onChange={onChange} />
                      <Field id="reg-phone" name="phone" type="tel" label="Phone" autoComplete="tel" value={data.phone} onChange={onChange} />
                    </div>
                  </fieldset>

                  <fieldset className="m-0 mt-12 border-0 p-0">
                    <FieldsetLegend>02 — Vehicle</FieldsetLegend>
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-6 gap-y-8 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-8">
                      <Field id="reg-year" name="vehicleYear" label="Year" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} errMsg="Enter a 4-digit year." value={data.vehicleYear} onChange={onChange} />
                      <Field id="reg-make" name="vehicleMake" label="Make" required value={data.vehicleMake} onChange={onChange} />
                      <Field id="reg-model" name="vehicleModel" label="Model" required className="col-span-2 sm:col-span-1" value={data.vehicleModel} onChange={onChange} />
                    </div>
                  </fieldset>

                  <fieldset className="choice-group m-0 mt-12 border-0 p-0">
                    <FieldsetLegend>
                      03 — Category
                      <span className="text-bryant-gold-deep" aria-hidden="true">&nbsp;*</span>
                      <span className="sr-only"> (required)</span>
                    </FieldsetLegend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {categories.map((c) => (
                        <RadioCard
                          key={c.value}
                          name="category"
                          value={c.value}
                          label={c.name}
                          icon={c.icon}
                          required
                          describedBy="reg-category-err"
                          checked={data.category === c.value}
                          onChange={onChange}
                          flashKey={flash && flash.value === c.value ? flash.n : null}
                        />
                      ))}
                    </div>
                    <p className="err" id="reg-category-err">Please choose a category.</p>
                  </fieldset>

                  <fieldset className="m-0 mt-12 border-0 p-0">
                    <FieldsetLegend>04 — Notes</FieldsetLegend>
                    <Field id="reg-comments" name="comments" label="Additional Comments" textarea rows={4} value={data.comments} onChange={onChange} />
                  </fieldset>

                  <SubmitButton status={status} label="Submit registration" />
                  <p className="mt-4 font-mono text-[12px] tracking-[.08em] text-bryant-stone">
                    Questions? <a href={`mailto:${EMAIL}`} className="u-static hover:text-bryant-ink">{EMAIL}</a>
                  </p>
                </form>
              )}
            </FormCard>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sponsors                                                            */
/* ------------------------------------------------------------------ */

function Sponsors({ data, setData }) {
  const wasDone = useRef(false);
  const [status, submit] = useSubmitFlow(() => setData(EMPTY_SPONSOR));

  useEffect(() => {
    if (status === 'done') wasDone.current = true;
    if (status === 'idle' && wasDone.current) {
      wasDone.current = false;
      const active = document.activeElement;
      if (!active || active === document.body) {
        const first = document.getElementById('sp-company');
        if (first) first.focus({ preventScroll: true });
      }
    }
  }, [status]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const clearLevel = () => setData((prev) => ({ ...prev, sponsorshipLevel: '' }));

  return (
    <section id="sponsors" aria-labelledby="sponsors-title" className="on-light bg-white py-24 text-bryant-ink md:py-40">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="self-start lg:sticky lg:top-28 lg:col-span-5">
            <Eyebrow index="06" tone="light">Partnership Opportunities</Eyebrow>
            <h2 id="sponsors-title" className="t-h2 mt-6 text-bryant-ink">
              Become a <span className="serif-accent text-bryant-gold">partner</span>.
            </h2>
            <p className="mt-6 max-w-[40ch] text-[18px] leading-relaxed text-bryant-stone">
              Support the Bryant University Car Show and connect with our community.
            </p>
            <p className="mt-6 text-[15px] text-bryant-stone">
              Prefer email?{' '}
              <a href={`mailto:${EMAIL}`} className="u-static font-medium text-bryant-gold-deep hover:text-bryant-ink">{EMAIL}</a>
            </p>
          </Reveal>

          <div className="lg:col-span-7">
            <FormCard minH="min-h-[600px]">
              {status === 'done' ? (
                <SuccessState
                  title="Inquiry Submitted!"
                  body="Thank you for your interest. We'll contact you soon to discuss partnership opportunities."
                />
              ) : (
                <form onSubmit={submit} aria-labelledby="sponsors-title">
                  <fieldset className="m-0 border-0 p-0">
                    <FieldsetLegend>01 — Company</FieldsetLegend>
                    <Field id="sp-company" name="companyName" label="Company Name" required autoComplete="organization" value={data.companyName} onChange={onChange} />
                  </fieldset>

                  <fieldset className="m-0 mt-12 border-0 p-0">
                    <FieldsetLegend>02 — Contact</FieldsetLegend>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                      <Field id="sp-contact" name="contactName" label="Contact Name" required autoComplete="name" value={data.contactName} onChange={onChange} />
                      <Field id="sp-email" name="email" type="email" label="Email" required autoComplete="email" errMsg="Please enter a valid email." value={data.email} onChange={onChange} />
                      <Field id="sp-phone" name="phone" type="tel" label="Phone" autoComplete="tel" value={data.phone} onChange={onChange} />
                    </div>
                  </fieldset>

                  <fieldset className="m-0 mt-12 border-0 p-0">
                    <FieldsetLegend>03 — Sponsorship Level of Interest</FieldsetLegend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {sponsorLevels.map((lvl) => (
                        <RadioCard
                          key={lvl.value}
                          name="sponsorshipLevel"
                          value={lvl.value}
                          label={lvl.label}
                          checked={data.sponsorshipLevel === lvl.value}
                          onChange={onChange}
                          onDeselect={clearLevel}
                        />
                      ))}
                    </div>
                    {data.sponsorshipLevel && (
                      <button type="button" onClick={clearLevel} className="u-link mt-3 min-h-[44px] text-[14px] font-medium text-bryant-stone hover:text-bryant-ink">
                        Clear selection
                      </button>
                    )}
                  </fieldset>

                  <fieldset className="m-0 mt-12 border-0 p-0">
                    <FieldsetLegend>04 — Message</FieldsetLegend>
                    <Field
                      id="sp-message"
                      name="message"
                      label="Message"
                      textarea
                      rows={4}
                      placeholder="Tell us about your company and sponsorship interests..."
                      value={data.message}
                      onChange={onChange}
                    />
                  </fieldset>

                  <SubmitButton status={status} label="Submit inquiry" />
                </form>
              )}
            </FormCard>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer + mobile CTA bar                                             */
/* ------------------------------------------------------------------ */

function Footer({ footerRef }) {
  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    const home = document.getElementById('brand-home');
    if (home) home.focus({ preventScroll: true });
  };

  const linkCls = 'u-link min-h-[44px] text-[15px] text-white';

  return (
    <footer ref={footerRef} className="bg-black pb-28 pt-24 text-white md:pb-10">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <BrandLockup size={48} sub="Car Club" lazy />
            <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-bryant-mist">
              Celebrating automotive excellence and bringing together the Bryant community through our shared passion for cars.
            </p>
          </div>

          <div>
            <h2 className="font-mono text-[12px] font-medium uppercase tracking-[.16em] text-bryant-gold-light">Visit</h2>
            <address className="mt-5 text-[15px] not-italic leading-relaxed text-bryant-mist">
              Bryant University<br />
              1150 Douglas Pike<br />
              Smithfield, RI 02917
            </address>
          </div>

          <div>
            <h2 className="font-mono text-[12px] font-medium uppercase tracking-[.16em] text-bryant-gold-light">Connect</h2>
            <ul className="mt-3">
              <li>
                <a href={`mailto:${EMAIL}`} className={`${linkCls} gap-2.5`}>
                  <i className="fa-solid fa-envelope text-[13px] text-bryant-gold-light" aria-hidden="true"></i>
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={IG_URL} target="_blank" rel="noopener noreferrer" className={`${linkCls} gap-2.5`}>
                  <i className="fa-brands fa-instagram text-[14px] text-bryant-gold-light" aria-hidden="true"></i>
                  {IG_HANDLE}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-[12px] font-medium uppercase tracking-[.16em] text-bryant-gold-light">Navigate</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 lg:grid-cols-1">
              {MENU_LINKS.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className={linkCls}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-20 border-t border-bryant-gold pt-8" aria-hidden="true">
          <svg className="wordmark select-none" viewBox="0 0 1000 112" preserveAspectRatio="xMidYMid meet" focusable="false">
            <defs>
              <linearGradient id="wm-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#B39A5A" stopOpacity=".55" />
                <stop offset="1" stopColor="#826E38" stopOpacity=".08" />
              </linearGradient>
            </defs>
            <text x="0" y="86" fontSize="108" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="url(#wm-grad)">
              Bryant Car Show 2027
            </text>
          </svg>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[12px] tracking-[.08em] text-bryant-mist sm:flex-row sm:items-center">
          <p>© 2027 Bryant University Car Club. Est. 2026. All rights reserved.</p>
          <button type="button" onClick={backToTop} className="u-link min-h-[44px] self-start uppercase tracking-[.14em] text-bryant-mist transition-colors duration-200 hover:text-white sm:self-auto">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

function MobileCTABar({ formsVisible, menuOpen }) {
  const [past, setPast] = useState(false);
  const pastRef = useRef(false);

  useScroll(({ y, vh }) => {
    const hero = document.getElementById('top');
    const h = hero ? hero.offsetHeight : vh;
    const p = y > h;
    if (p !== pastRef.current) {
      pastRef.current = p;
      setPast(p);
    }
  });

  const show = past && !formsVisible && !menuOpen;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-white/10 bg-black/85 px-4 pt-3 backdrop-blur-md transition-transform duration-300 ease-lux md:hidden"
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', transform: show ? 'translateY(0)' : 'translateY(110%)' }}
      aria-hidden={show ? undefined : 'true'}
    >
      <a href="#register" tabIndex={show ? 0 : -1} className="btn btn-gold h-12 flex-1">
        Register
        <ArrowIcon />
      </a>
      <a href="#sponsors" tabIndex={show ? 0 : -1} className="btn btn-ghost h-12 flex-1">
        Sponsor
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function App() {
  const [formData, setFormData] = useState(EMPTY_REG);
  const [sponsorData, setSponsorData] = useState(EMPTY_SPONSOR);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flash, setFlash] = useState(null);
  const toggleRef = useRef(null);
  const mainRef = useRef(null);
  const footerRef = useRef(null);
  const finishRegRef = useRef(null);
  const flashTimer = useRef(null);
  const focusTimer = useRef(null);

  const { active, formsVisible } = useActiveSection(['about', 'rules', 'schedule', 'categories', 'register', 'sponsors']);

  const closeMenu = useCallback((returnFocus) => {
    setMenuOpen(false);
    if (returnFocus && toggleRef.current) toggleRef.current.focus({ preventScroll: true });
  }, []);

  const toggleMenu = () => {
    if (menuOpen) closeMenu(true);
    else setMenuOpen(true);
  };

  // Close the mobile menu if the viewport grows past the md breakpoint.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => { if (e.matches) setMenuOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Keep the page behind the full-screen mobile menu out of reach for AT.
  useEffect(() => {
    [mainRef.current, footerRef.current].forEach((el) => {
      if (!el) return;
      el.inert = menuOpen;
      if (menuOpen) el.setAttribute('aria-hidden', 'true');
      else el.removeAttribute('aria-hidden');
    });
  }, [menuOpen]);

  useEffect(() => () => {
    clearTimeout(flashTimer.current);
    clearTimeout(focusTimer.current);
  }, []);

  const pickCategory = (value) => {
    // If a registration was just submitted, finish its reset now so the new pick is kept.
    if (finishRegRef.current) finishRegRef.current();
    setFormData((prev) => ({ ...prev, category: value }));
    setFlash({ value, n: Date.now() });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 900);
    scrollToId('register');
    clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => {
      const first = document.getElementById('reg-firstName');
      if (first) first.focus({ preventScroll: true });
    }, 450);
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <SkipLink />
      <ScrollProgress />
      <Nav active={active} menuOpen={menuOpen} onToggle={toggleMenu} toggleRef={toggleRef} />
      <MobileMenu open={menuOpen} onClose={closeMenu} toggleRef={toggleRef} />

      <main id="main" ref={mainRef} tabIndex={-1}>
        <Hero />
        <SpecStrip />
        <About />
        <GroundRules />
        <ImageBand />
        <Schedule />
        <Categories onPick={pickCategory} />
        <Register data={formData} setData={setFormData} flash={flash} finishRef={finishRegRef} />
        <Sponsors data={sponsorData} setData={setSponsorData} />
      </main>

      <Footer footerRef={footerRef} />
      <MobileCTABar formsVisible={formsVisible} menuOpen={menuOpen} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
