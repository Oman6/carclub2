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

// gap = time since the previous event (timing-tower "interval")
const schedule = [
  { time: '9:00 AM', code: 'REG', event: 'Registration Opens', detail: 'Check-in for registered participants', gap: 'Start' },
  { time: '10:00 AM', code: 'GTS', event: 'Gates Open to Public', detail: 'General admission begins', gap: '+1:00' },
  { time: '12:30 PM', code: 'EAT', event: 'Food & Refreshments', detail: 'Lunch available from local vendors', gap: '+2:30' },
  { time: '3:30 PM', code: 'FIN', event: 'Event Concludes', detail: 'Thank you for attending', gap: '+3:00' }
];

// minutes between the schedule's times: 60 + 150 + 180 = 6 h 30 min
const sectors = [
  { n: 'S1', label: 'Registration', span: '9:00–10:00 AM', mins: 60, bg: '#B39A5A', fg: '#0A0A0A' },
  { n: 'S2', label: 'Gates open', span: '10:00 AM–12:30 PM', mins: 150, bg: '#8C7A48', fg: '#0A0A0A' },
  { n: 'S3', label: 'Food & refreshments → finish', span: '12:30–3:30 PM', mins: 180, bg: '#3A3427', fg: '#F2EEE4' }
];

const categories = [
  { name: 'Classic Cars', description: 'Vehicles manufactured 1900-1979', code: 'CLASSIC', value: 'classic' },
  { name: 'Muscle Cars', description: 'High-performance American V8 vehicles', code: 'MUSCLE', value: 'muscle' },
  { name: 'Exotic & Luxury', description: 'Premium and rare automobiles', code: 'EXOTIC', value: 'exotic' },
  { name: 'Modern Performance', description: 'Contemporary sports and performance cars', code: 'MODERN', value: 'modern' },
  { name: 'Motorcycles', description: 'Sport bikes, cruisers, and custom motorcycles', code: 'MOTO', value: 'motorcycles' },
  { name: 'Custom & Modified', description: 'Customized and modified vehicles', code: 'CUSTOM', value: 'custom' },
  { name: 'Electric & Alternative', description: 'Electric and alternative fuel vehicles', code: 'ELECTRC', value: 'electric' }
];

const rules = [
  { name: 'Donuts', label: 'No donuts', icon: 'donuts' },
  { name: 'Burnouts', label: 'No burnouts', icon: 'burnouts' },
  { name: 'Drag Racing', label: 'No drag racing', icon: 'drag' },
  { name: 'Excessive Revving', label: 'No excessive revving', icon: 'revving' },
  { name: 'Loud Music', label: 'No loud music', icon: 'music' },
  { name: 'Drugs and Alcohol', label: 'No drugs or alcohol', icon: 'drugs' }
];

const sponsorLevels = [
  { label: 'Platinum Sponsor', short: 'Platinum', value: 'platinum' },
  { label: 'Gold Sponsor', short: 'Gold', value: 'gold' },
  { label: 'Silver Sponsor', short: 'Silver', value: 'silver' },
  { label: 'Bronze Sponsor', short: 'Bronze', value: 'bronze' },
  { label: 'In-Kind Donation', short: 'In-Kind', value: 'inkind' },
  { label: 'Other/Discuss', short: 'Other', value: 'other' }
];

const HERO_FACTS = [
  { k: 'Registration', v: '9:00 AM', num: true },
  { k: 'Gates open', v: '10:00 AM', num: true },
  { k: 'Location', v: 'Bryant University Campus, Smithfield, RI' },
  { k: 'Admission', v: 'Free for Bryant students & staff · $5 general' }
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

// After a submitted form resets, put focus back on its first field (unless focus moved elsewhere).
function useRefocusAfterReset(status, firstId) {
  const wasDone = useRef(false);
  useEffect(() => {
    if (status === 'done') wasDone.current = true;
    if (status === 'idle' && wasDone.current) {
      wasDone.current = false;
      const active = document.activeElement;
      if (!active || active === document.body) {
        const first = document.getElementById(firstId);
        if (first) first.focus({ preventScroll: true });
      }
    }
  }, [status]);
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
      className="inline-flex flex-none items-center justify-center rounded-full border-2 border-bryant-gold-light bg-black font-extrabold italic text-bryant-gold-light"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.44), lineHeight: 1 }}
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
    <p className={`t-label ${color} ${className}`}>
      {index} <span aria-hidden="true">—</span> {children}
    </p>
  );
}

function Arrow({ className = '' }) {
  return (
    <svg className={`arrow flex-none ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Required() {
  return (
    <React.Fragment>
      <span className="text-bryant-gold-light" aria-hidden="true">&nbsp;*</span>
      <span className="sr-only"> (required)</span>
    </React.Fragment>
  );
}

function Field({ id, label, required = false, textarea = false, errMsg, className = '', ...input }) {
  const errId = `${id}-err`;
  const Comp = textarea ? 'textarea' : 'input';
  return (
    <div className={`fld-wrap ${className}`}>
      <label htmlFor={id} className="lbl">
        {label}
        {required && <Required />}
      </label>
      <Comp
        id={id}
        required={required}
        aria-describedby={required ? errId : undefined}
        className={`fld ${textarea ? 'fld-area' : ''}`}
        {...input}
      />
      {required && <p className="err" id={errId}>{errMsg || 'Please fill out this field.'}</p>}
    </div>
  );
}

function SelectField({ id, label, required = false, errMsg, options, placeholder, flashKey = null, className = '', ...input }) {
  const errId = `${id}-err`;
  return (
    <div className={`fld-wrap ${className}`}>
      <label htmlFor={id} className="lbl">
        {label}
        {required && <Required />}
      </label>
      <div className="relative">
        {flashKey !== null && <span key={flashKey} className="flash-ring" aria-hidden="true"></span>}
        <select
          id={id}
          required={required}
          aria-describedby={required ? errId : undefined}
          className="fld fld-select"
          {...input}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {required && <p className="err" id={errId}>{errMsg || 'Please choose an option.'}</p>}
    </div>
  );
}

function FormLegend({ children }) {
  return <legend className="t-label mb-5 p-0 text-bryant-gold-light">{children}</legend>;
}

function SubmitButton({ status, label, busyLabel = 'Submitting' }) {
  const busy = status === 'submitting';
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy ? 'true' : 'false'}
      className="btn btn-gold chamfer mt-9 h-[60px] w-full"
    >
      {busy ? (
        <React.Fragment>
          <i className="fa-solid fa-spinner fa-spin text-[14px]" aria-hidden="true"></i>
          {busyLabel}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {label}
          <Arrow />
        </React.Fragment>
      )}
    </button>
  );
}

function SuccessState({ kicker, title, body, minH = 'min-h-[520px]' }) {
  const headingRef = useRef(null);
  useEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, []);
  return (
    <div role="status" aria-live="polite" className={`success-in flex flex-col justify-center gap-5 ${minH}`}>
      <p className="t-label text-bryant-gold-light">{kicker}</p>
      <h3 ref={headingRef} tabIndex={-1} className="t-display text-bryant-bone focus:outline-none" style={{ fontSize: 'clamp(3rem, 8vw, 5.25rem)' }}>
        {title}
      </h3>
      <p className="max-w-[44ch] text-[18px] leading-relaxed text-bryant-smoke">{body}</p>
    </div>
  );
}

/* Five start-light pods. `lit` drives them from state; `sequence` runs the lights-out loop in CSS. */
function StartLights({ lit = [], sequence = false, large = false, label }) {
  return (
    <div
      className={`lights ${large ? 'lights-lg' : ''} ${sequence ? 'seq' : ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const cls = `lt l${i + 1} ${!sequence && lit[i] ? 'on' : ''}`;
        return (
          <div key={i} className="pod">
            <span className={cls}></span>
            <span className={cls}></span>
          </div>
        );
      })}
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
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:inline-flex focus:h-10 focus:items-center focus:bg-bryant-gold-light focus:px-4 focus:text-[13px] focus:font-extrabold focus:uppercase focus:tracking-[.12em] focus:text-bryant-ink"
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
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-bryant-gold-light"
      style={{ transform: 'scaleX(0)' }}
    ></div>
  );
}

function BrandLockup({ size = 44, sub = 'Car Club · Est. 2026', lazy = false }) {
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
        <span className="block text-[13px] font-extrabold uppercase tracking-[.08em] text-white [font-stretch:112%] sm:text-[14px]">Bryant University</span>
        <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[.24em] text-bryant-gold-light [font-stretch:112%]">{sub}</span>
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

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex lg:gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="nav-link t-nav py-2"
              aria-current={active === link.id ? 'true' : undefined}
            >
              {link.label}
              <span className="nav-u" aria-hidden="true"></span>
            </a>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2 md:gap-6">
          <a href="#register" className="btn btn-gold chamfer-sm hidden h-11 px-5 text-[12px] tracking-[.16em] sm:inline-flex">
            Register
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
      className="menu-in fixed inset-0 z-40 flex flex-col overflow-y-auto bg-bryant-night px-4 pb-10 pt-24 md:hidden"
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
                <span className="text-[13px] font-black italic text-bryant-gold-light">{pad2(i + 1)}</span>
                <span className="t-display text-[44px] text-white">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="menu-item mt-auto pt-10" style={{ animationDelay: `${60 + MENU_LINKS.length * 40}ms` }}>
        <div className="checker-sm mb-6 h-3 w-24" aria-hidden="true"></div>
        <p className="text-[13px] leading-relaxed tracking-[.04em] text-bryant-mist">
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
/* Hero: lights out                                                    */
/* ------------------------------------------------------------------ */

function Hero() {
  const mediaRef = useRef(null);
  const [imgOk, setImgOk] = useState(true);

  useScroll(({ y, vh }) => {
    if (REDUCED || y > vh * 1.2) return;
    if (mediaRef.current) mediaRef.current.style.transform = `translate3d(0, ${(y * 0.2).toFixed(1)}px, 0)`;
  });

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex flex-col overflow-hidden bg-bryant-night text-bryant-bone"
      style={{ minHeight: 'max(700px, 100svh)' }}
    >
      <div ref={mediaRef} className="absolute inset-0 -z-30 will-change-transform">
        {imgOk && (
          <img
            src={HERO_IMG}
            alt="Classic cars displayed on a university campus lawn"
            className="hero-img h-full w-full object-cover"
            fetchpriority="high"
            decoding="async"
            onError={() => setImgOk(false)}
          />
        )}
      </div>
      <div className="hero-shade absolute inset-0 -z-20" aria-hidden="true"></div>

      <div className="stripes" aria-hidden="true">
        <span></span>
        <span></span>
        <div className="roundel">
          <span className="roundel-tag mt-4">BRYANT · RI</span>
          <span className="roundel-num">27</span>
          <span className="roundel-tag">CAR SHOW</span>
        </div>
      </div>

      <div className="wrap pt-16 md:pt-20">
        <div className="pinstripe" aria-hidden="true"></div>
      </div>

      <div className="wrap flex flex-1 flex-col pb-8 pr-[56px] pt-9 md:pr-[72px] md:pt-12 xl:pr-12">
        <div className="fade-up flex flex-wrap items-center gap-4 sm:gap-6">
          <StartLights sequence />
          <div className="flex flex-col gap-1.5">
            <span className="go-label text-[13px] font-extrabold italic tracking-[.3em] text-bryant-bone [font-stretch:112%] sm:text-[15px]" aria-hidden="true">LIGHTS OUT</span>
            <span className="t-label text-bryant-gold-light">{EVENT_DATE}</span>
          </div>
        </div>

        <h1 id="hero-title" className="t-display t-h1 fade-up mt-7" style={{ animationDelay: '120ms' }}>
          Bryant{' '}<br />University{' '}<br /><span className="text-bryant-gold-light">Car Show</span>
          <span className="sr-only"> 2027</span>
        </h1>

        <p className="t-lead fade-up mt-6 max-w-[46ch] text-bryant-smoke" style={{ animationDelay: '220ms' }}>
          Join the Bryant community for our premier automotive showcase — a day celebrating automotive design, engineering, and the passion that drives us forward.
        </p>

        <div className="fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: '320ms' }}>
          <a href="#register" className="btn btn-gold chamfer h-14 px-7 sm:h-[58px] sm:px-8">
            Register your vehicle
            <Arrow />
          </a>
          <a href="#sponsors" className="btn btn-ghost h-14 px-7 sm:h-[58px]">
            Become a sponsor
          </a>
        </div>

        <div className="fade-up mt-auto pt-12" style={{ animationDelay: '420ms' }}>
          <div className="flex flex-col lg:h-[60px] lg:flex-row lg:items-stretch">
            <div className="flex h-14 flex-none items-stretch lg:h-auto">
              <span className="checker w-14 flex-none lg:w-[60px]" aria-hidden="true"></span>
              <span
                className="flex items-center bg-bryant-gold-light pl-5 pr-9 text-[17px] font-black italic text-bryant-ink"
                style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 18px) 100%, 0 100%)' }}
              >
                CAR SHOW 2027
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border border-bryant-line bg-[rgba(10,10,10,.88)] p-4 sm:p-5 lg:-ml-[18px] lg:flex lg:flex-1 lg:items-center lg:justify-between lg:gap-6 lg:border-l-0 lg:py-0 lg:pl-9 lg:pr-7">
              {HERO_FACTS.map((f) => (
                <div key={f.k} className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[.22em] text-bryant-gold-light [font-stretch:112%]">{f.k}</dt>
                  <dd className={`mt-1 text-[14px] font-bold leading-snug text-bryant-bone sm:text-[15px] ${f.num ? 'tnum' : ''}`}>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
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
        style={{ backgroundImage: `url("${HERO_IMG}")`, filter: 'grayscale(1) contrast(1.1) brightness(.7)' }}
        aria-hidden="true"
      ></div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(7,7,7,.92) 0%, rgba(7,7,7,.6) 55%, rgba(7,7,7,.3) 100%)' }} aria-hidden="true"></div>
      <div className="absolute inset-y-0 right-[8%] flex w-[64px] gap-3 sm:w-[96px] sm:gap-4" aria-hidden="true">
        <span className="flex-1 bg-bryant-gold-light"></span>
        <span className="flex-1 bg-bryant-gold-light"></span>
      </div>
      <div className="relative flex h-full flex-col justify-end gap-4 p-6 sm:p-10 md:p-14" aria-hidden="true">
        <span className="t-label text-bryant-gold-light">Car Club · Est. 2026</span>
        <span className="t-display text-bryant-bone" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
          Bryant<br />University
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
    <figure ref={ref} className={`reveal ${inView ? 'is-in' : ''} mt-16 md:mt-20`}>
      <div className={`relative overflow-hidden bg-bryant-carbon ${failed ? 'aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/6]' : 'aspect-[4/3] md:aspect-[16/7]'}`}>
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
        <figcaption className="t-label mt-3 text-[11px] text-bryant-stone">
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
    <section id="about" aria-labelledby="about-title" className="on-light bg-bryant-bone py-24 text-bryant-ink md:py-32">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-6">
            <Eyebrow index="01" tone="light">About the Event</Eyebrow>
            <h2 id="about-title" className="t-display t-h2 mt-4">
              A celebration of automotive <span className="text-bryant-gold-deep">innovation.</span>
            </h2>
          </Reveal>
          <div className="space-y-6 text-[18px] leading-[1.65] lg:col-span-5 lg:col-start-8 lg:pt-8">
            <Reveal as="p" className="max-w-[62ch]">
              The Bryant University Car Show brings together automotive enthusiasts, students, alumni, and the local community for a day of celebration and appreciation of automotive design, engineering, and culture.
            </Reveal>
            <Reveal as="p" delay={80} className="max-w-[62ch] text-bryant-stone">
              This event reflects Bryant's commitment to innovation, excellence, and community engagement. Whether you're a collector, restorer, student, or simply appreciate fine automobiles, this showcase offers something for everyone.
            </Reveal>
          </div>
        </div>

        <Banner />

        <Reveal>
          <dl className="mt-12 grid grid-cols-1 gap-8 border-t-2 border-bryant-ink pt-8 md:grid-cols-3">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="t-label text-bryant-gold-deep">{f.k}</dt>
                <dd className="mt-2 text-[20px] font-semibold leading-snug tracking-[-0.01em]">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Instrument cluster (stats)                                          */
/* ------------------------------------------------------------------ */

const ARC = 'M66.6 233.4 A118 118 0 1 1 233.4 233.4';
const TICKS = 'M77.9 222.1 A102 102 0 1 1 222.1 222.1';
const LED_COLORS = ['#B39A5A', '#B39A5A', '#B39A5A', '#B39A5A', '#D9C38A', '#D9C38A', '#D9C38A', '#D9C38A', '#FF3B2F', '#FF3B2F', '#FF3B2F', '#FF3B2F'];

// fill = % of the 270° arc, deg = needle angle (135° is the zero stop)
function Dial({ big, fill, deg, min, max, redline = false, fuel = false }) {
  return (
    <svg viewBox="0 0 300 265" className="mx-auto block h-auto w-full max-w-[250px]" aria-hidden="true" focusable="false">
      <circle cx="150" cy="150" r="140" fill="#050505" stroke="#2A2A2A" strokeWidth="2" />
      <path d={ARC} fill="none" stroke="#1C1C1C" strokeWidth="12" />
      <path className="arcfill" d={ARC} pathLength="100" fill="none" stroke="#B39A5A" strokeWidth="12" style={{ '--fill': String(fill) }} />
      {redline && <path d={ARC} pathLength="100" fill="none" stroke="#FF3B2F" strokeWidth="12" strokeDasharray="12 100" strokeDashoffset="-88" />}
      <path d={TICKS} pathLength="100" fill="none" stroke="#6E675A" strokeWidth="9" strokeDasharray={fuel ? '0.9 24.1' : '0.7 9.3'} />
      <text x="60" y="262" fill="#8C8574" fontSize={fuel ? 16 : 13} fontWeight="800">{min}</text>
      <text x={fuel ? 228 : 214} y="262" fill={fuel ? '#D9C38A' : '#8C8574'} fontSize={fuel ? 16 : 13} fontWeight="800">{max}</text>
      {fuel && (
        <g transform="translate(136 82)" fill="none" stroke="#8C8574" strokeWidth="2">
          <rect x="0" y="0" width="16" height="22" rx="2" />
          <path d="M16 6h4l3 4v10a2 2 0 0 1-4 0v-6h-3" />
          <path d="M3 5h10" />
        </g>
      )}
      <line className="needle" x1="150" y1="150" x2="252" y2="150" stroke="#FF3B2F" strokeWidth="4" strokeLinecap="round" style={{ '--deg': `${deg}deg` }} />
      <circle cx="150" cy="150" r="12" fill="#0A0A0A" stroke="#B39A5A" strokeWidth="3" />
      {/* readout sits on top of the needle, with a dark halo so the needle reads as passing behind it */}
      <text x="150" y="212" textAnchor="middle" fill="#F2EEE4" fontSize="44" fontWeight="900" fontStyle="italic" stroke="#050505" strokeWidth="10" strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>{big}</text>
    </svg>
  );
}

function GearReadout() {
  return (
    <div className="mx-auto flex aspect-[300/265] w-full max-w-[250px] flex-col items-center justify-center gap-3" aria-hidden="true">
      <div className="flex gap-2.5 text-[14px] font-extrabold italic text-[#4A453B] sm:gap-3 sm:text-[16px]">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} className={n === 7 ? 'text-bryant-gold-light' : ''}>{n}</span>
        ))}
      </div>
      <div className="gear-box flex h-[104px] w-[104px] items-center justify-center border-2 border-bryant-gold-light bg-[#050505] sm:h-[150px] sm:w-[150px]" style={{ boxShadow: 'inset 0 0 40px rgba(179,154,90,.25)' }}>
        <span className="text-[86px] font-black italic leading-none text-bryant-bone [font-stretch:70%] sm:text-[128px]">7</span>
      </div>
      <span className="t-label text-[10px] text-bryant-label">Gear</span>
    </div>
  );
}

function Gauge({ sr, label, children }) {
  return (
    <li className="flex flex-col items-center gap-1">
      <span className="sr-only">{sr}</span>
      {children}
      <p className="t-label text-center text-[11px] text-bryant-smoke sm:text-[12px]" aria-hidden="true">{label}</p>
    </li>
  );
}

function Cluster() {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.25 });
  return (
    <section id="numbers" aria-labelledby="numbers-title" className="bg-bryant-night py-24 text-bryant-bone md:py-32">
      <div className="wrap">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow index="02">Instrument Cluster</Eyebrow>
            <h2 id="numbers-title" className="t-display t-h2 mt-4">Expected on the lawn</h2>
          </div>
          <p className="max-w-[32ch] text-[16px] leading-relaxed text-bryant-mist">
            What we're planning for in our inaugural year on the Smithfield campus.
          </p>
        </Reveal>

        <div ref={ref} className={`carbon chamfer-top mt-12 border-t border-[#2B2B2B] px-3 pb-8 pt-6 sm:px-8 lg:px-10 ${inView ? 'is-in' : ''}`}>
          <div className="flex justify-center">
            <div className="leds" aria-hidden="true">
              {LED_COLORS.map((c, i) => (
                <span key={i} className="led" style={{ background: c, animationDelay: `${(i * 0.08).toFixed(2)}s` }}></span>
              ))}
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            <Gauge sr="150+ vehicles expected" label="Vehicles Expected">
              <Dial big="150+" fill={75} deg={337.5} min="0" max="200" redline />
            </Gauge>
            <Gauge sr="500+ attendees" label="Attendees">
              <Dial big="500+" fill={83.3} deg={360} min="0" max="600" />
            </Gauge>
            <Gauge sr="7 vehicle categories" label="Vehicle Categories">
              <GearReadout />
            </Gauge>
            <Gauge sr="Free for Bryant students" label="For Bryant Students">
              <Dial big="FREE" fill={100} deg={405} min="E" max="F" fuel />
            </Gauge>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ground rules: road signs + black flag                               */
/* ------------------------------------------------------------------ */

function SignGlyph({ kind }) {
  const s = { fill: 'none', stroke: '#0A0A0A', strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'donuts':
      return (
        <g {...s}>
          <rect x="42" y="34" width="16" height="30" rx="5" />
          <path d="M50 22 A28 28 0 1 1 26 36" />
          <path d="M22 30 L26 37 L33 33" />
        </g>
      );
    case 'burnouts':
      return (
        <g {...s}>
          <circle cx="54" cy="62" r="15" strokeWidth="5" />
          <circle cx="54" cy="62" r="5" fill="#0A0A0A" stroke="none" />
          <path d="M24 46 a7 7 0 0 1 8 -9 a9 9 0 0 1 16 -3 a7 7 0 0 1 9 8" />
          <path d="M26 56 h10 M22 64 h12 M26 72 h10" />
        </g>
      );
    case 'drag':
      return (
        <g {...s}>
          <rect x="31" y="22" width="14" height="28" rx="4" />
          <rect x="55" y="22" width="14" height="28" rx="4" />
          <path d="M34 58 v16 M42 58 v10 M58 58 v16 M66 58 v10" />
        </g>
      );
    case 'revving':
      return (
        <g {...s}>
          <path d="M26 66 A27 27 0 1 1 74 66" strokeWidth="4" />
          <path d="M67 40 A27 27 0 0 1 74 66" stroke="#D62B21" strokeWidth="6" strokeLinecap="butt" />
          <path d="M50 58 L70 44" strokeWidth="4" />
          <circle cx="50" cy="58" r="4.5" fill="#0A0A0A" stroke="none" />
        </g>
      );
    case 'music':
      return (
        <g {...s}>
          <path d="M26 42 h9 l12 -10 v36 l-12 -10 h-9 z" fill="#0A0A0A" stroke="none" />
          <path d="M55 42 a10 10 0 0 1 0 16 M61 36 a18 18 0 0 1 0 28 M67 30 a26 26 0 0 1 0 40" />
        </g>
      );
    default:
      return (
        <g {...s}>
          <path d="M37 22 h8 v10 l5 8 v34 h-18 v-34 l5 -8 z" />
          <rect x="56" y="50" width="22" height="11" rx="5.5" transform="rotate(-35 67 55.5)" />
        </g>
      );
  }
}

function RuleSign({ kind }) {
  return (
    <svg viewBox="0 0 100 100" className="h-auto w-[min(150px,36vw)]" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" fill="#F2EEE4" stroke="#D62B21" strokeWidth="8" />
      <SignGlyph kind={kind} />
      <line x1="20" y1="20" x2="80" y2="80" stroke="#D62B21" strokeWidth="8" />
    </svg>
  );
}

function GroundRules() {
  return (
    <section id="rules" aria-labelledby="rules-title" className="asphalt py-24 text-bryant-bone md:py-32">
      <div className="wrap">
        <div className="flex items-start justify-between gap-10">
          <Reveal className="max-w-[780px]">
            <Eyebrow index="03">Ground Rules</Eyebrow>
            <h2 id="rules-title" className="t-display t-h2 mt-4">
              Drive slow.{' '}<br /><span className="text-bryant-gold-light">Be aware.</span>
            </h2>
            <p className="t-lead mt-6 text-bryant-smoke">
              We are expecting hundreds of people to attend the show, so it is crucial to drive slow and be aware of your surroundings.
            </p>
          </Reveal>
          <Reveal delay={120} className="hidden md:block">
            <div className="slow-sign flex" role="img" aria-label="Warning sign: Slow">
              <div className="slow-diamond"><span>SLOW</span></div>
            </div>
          </Reveal>
        </div>

        <div className="lane mt-12 md:mt-14" aria-hidden="true"></div>

        <Reveal as="p" className="t-label mt-10 text-bryant-bone">
          We will not tolerate any reckless or obnoxious behavior, such as:
        </Reveal>

        <ul aria-label="Prohibited behavior" className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {rules.map((r, i) => (
            <Reveal as="li" key={r.icon} delay={i * 60} className="flex flex-col items-center gap-4 text-center">
              <RuleSign kind={r.icon} />
              <span className="text-[17px] font-extrabold uppercase italic leading-tight [font-stretch:90%] sm:text-[20px]">{r.label}</span>
            </Reveal>
          ))}
        </ul>

        <Reveal role="note" className="chamfer mt-14 flex flex-col gap-5 bg-bryant-bone p-6 text-bryant-ink sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-6">
          <div className="relative h-[74px] w-[104px] flex-none" aria-hidden="true">
            <span className="absolute left-0 top-0 h-[74px] w-[6px] bg-bryant-ink"></span>
            <svg className="flag absolute left-[6px] top-[2px]" width="96" height="56" viewBox="0 0 96 56" focusable="false">
              <path d="M0 0 C22 6 40 -4 62 2 C78 6 88 3 96 0 L96 52 C88 55 78 58 62 54 C40 48 22 58 0 52 Z" fill="#0A0A0A" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <span className="t-label text-[#6B5A2C]">Black flag</span>
            <p className="t-display leading-[.95]" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)' }}>
              If you are seen conducting any of this behavior, you will be asked to leave IMMEDIATELY!
            </p>
          </div>
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
    <section ref={sectionRef} aria-label="Bryant University Campus" className="relative isolate flex items-end overflow-hidden bg-bryant-carbon" style={{ minHeight: 'max(420px, 60svh)' }}>
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
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to top, rgba(7,7,7,.94) 0%, rgba(7,7,7,.55) 45%, rgba(7,7,7,.35) 100%)' }} aria-hidden="true"></div>
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg, rgba(7,7,7,.75) 0%, rgba(7,7,7,.25) 60%, transparent 100%)' }} aria-hidden="true"></div>
      <div className="checker-sm absolute inset-x-0 top-0 h-3" aria-hidden="true"></div>
      <div className="wrap relative py-16 md:py-24">
        <Reveal>
          <p className="t-label text-bryant-gold-light">Bryant University Campus <span aria-hidden="true">·</span> Smithfield, RI</p>
          <p className="t-display mt-5 max-w-[14ch] text-bryant-bone" style={{ fontSize: 'clamp(2.75rem, 8vw, 6rem)' }}>
            Design, engineering, and the <span className="text-bryant-gold-light">passion</span> that drives us.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Schedule: timing tower                                              */
/* ------------------------------------------------------------------ */

const TOWER_BARS = ['#B39A5A', '#B39A5A', '#8C7A48', '#5E5233'];
const TOWER_COLS = 'grid-cols-[44px_6px_minmax(0,1fr)_auto] sm:grid-cols-[64px_8px_minmax(0,1fr)_150px_110px]';

function Schedule() {
  return (
    <section id="schedule" aria-labelledby="schedule-title" className="relative isolate overflow-hidden bg-bryant-night py-24 text-bryant-bone md:py-32">
      <div className="speedlines absolute -right-32 -top-20 -z-10 h-[1200px] w-[760px]" aria-hidden="true"></div>
      <div className="wrap">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="self-start lg:sticky lg:top-28 lg:col-span-5">
            <Eyebrow index="04">Schedule</Eyebrow>
            <h2 id="schedule-title" className="t-display t-h2 mt-4">
              Show day,{' '}<br /><span className="text-bryant-gold-light">lap by lap.</span>
            </h2>
            <p className="t-lead mt-6 text-bryant-smoke">
              Four times to know. The exact date drops soon — the show is coming in April 2027.
            </p>
            <p className="t-label mt-8 inline-flex items-center gap-3 border border-[rgba(179,154,90,.5)] px-4 py-2.5 text-bryant-gold-pale">
              <span className="h-2 w-2 flex-none bg-bryant-gold-light" aria-hidden="true"></span>
              {EVENT_DATE}
            </p>
          </Reveal>

          <div className="lg:col-span-7">
            <div className="flex h-12 items-stretch">
              <span className="checker-sm w-12 flex-none" aria-hidden="true"></span>
              <div className="flex flex-1 items-center justify-between gap-3 bg-bryant-gold-light px-4 text-bryant-ink sm:px-5">
                <span className="text-[15px] font-black italic sm:text-[18px]">BRYANT CAR SHOW 2027</span>
                <span className="t-label hidden text-[11px] sm:inline">Timing · 4 events</span>
              </div>
            </div>
            <div className={`mt-2 hidden pb-1 sm:grid ${TOWER_COLS}`} aria-hidden="true">
              <span className="t-label pl-3.5 text-[10px] text-bryant-label">Pos</span>
              <span></span>
              <span className="t-label pl-5 text-[10px] text-bryant-label">Event</span>
              <span className="t-label pr-5 text-right text-[10px] text-bryant-label">Time</span>
              <span className="t-label pr-5 text-right text-[10px] text-bryant-label">Interval</span>
            </div>
            <ol className="mt-2 flex flex-col gap-1.5 sm:mt-0" aria-label="Schedule of events">
              {schedule.map((item, i) => {
                const last = i === schedule.length - 1;
                return (
                  <Reveal as="li" key={item.code} delay={i * 80} className={`tower-row grid min-h-[96px] border border-bryant-line bg-[rgba(22,22,22,.96)] sm:min-h-[104px] ${TOWER_COLS}`}>
                    {last ? (
                      <span className="checker flex items-center justify-center" aria-hidden="true">
                        <span className="flex h-8 w-8 items-center justify-center bg-bryant-bone text-[22px] font-black italic text-bryant-ink sm:h-10 sm:w-10 sm:text-[30px]">{i + 1}</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center bg-bryant-bone text-[26px] font-black italic text-bryant-ink sm:text-[34px]" aria-hidden="true">{i + 1}</span>
                    )}
                    <span style={{ background: TOWER_BARS[i] }} aria-hidden="true"></span>
                    <div className="flex min-w-0 flex-col justify-center gap-1 px-3.5 py-3 sm:px-5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="text-[18px] font-black tracking-[.04em] [font-stretch:112%] sm:text-[26px]" aria-hidden="true">{item.code}</span>
                        <h3 className="text-[16px] font-bold leading-tight sm:text-[20px]">{item.event}</h3>
                      </div>
                      <p className="text-[14px] leading-snug text-bryant-mist sm:text-[15px]">{item.detail}</p>
                    </div>
                    <time className="tnum flex items-center justify-end whitespace-nowrap pr-3.5 text-[17px] font-extrabold italic sm:pr-5 sm:text-[28px]">{item.time}</time>
                    <span
                      className={`tnum hidden items-center justify-end pr-5 sm:flex ${i === 0 ? 't-label text-bryant-gold-light' : 'text-[18px] font-bold text-bryant-smoke'}`}
                      aria-hidden="true"
                    >
                      {item.gap}
                    </span>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>

        <Reveal className="mt-14">
          <div className="t-label flex justify-between text-[11px] text-bryant-label">
            <span className="tnum">9:00 AM</span>
            <span className="hidden sm:inline">Show day · 6 h 30 min</span>
            <span className="tnum">3:30 PM</span>
          </div>
          <div
            className="mt-2.5 grid h-14 gap-1"
            style={{ gridTemplateColumns: sectors.map((s) => `${s.mins}fr`).join(' ') }}
            role="img"
            aria-label="Show day in three sectors: registration 9:00 to 10:00 AM, gates open 10:00 AM to 12:30 PM, food and refreshments 12:30 to 3:30 PM"
          >
            {sectors.map((s) => (
              <div key={s.n} className="flex min-w-0 items-center justify-between gap-2 px-3 sm:px-4" style={{ background: s.bg, color: s.fg }}>
                <span className="text-[15px] font-black italic sm:text-[16px]">{s.n}</span>
                <span className="hidden truncate text-[13px] font-bold md:inline">{s.label}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-[14px] text-bryant-smoke sm:grid-cols-3 md:hidden" aria-hidden="true">
            {sectors.map((s) => (
              <div key={s.n} className="flex gap-2">
                <dt className="font-black italic text-bryant-gold-light">{s.n}</dt>
                <dd>{s.label} · <span className="tnum">{s.span}</span></dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Categories: black-and-gold plates                                   */
/* ------------------------------------------------------------------ */

function Categories({ onPick }) {
  const [picked, setPicked] = useState('classic');
  const idx = Math.max(0, categories.findIndex((c) => c.value === picked));
  const sel = categories[idx];

  return (
    <section id="categories" aria-labelledby="categories-title" className="garage-wall relative isolate py-24 text-bryant-bone md:py-32">
      <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true"></div>
      <div className="wrap">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow index="05">Vehicle Categories</Eyebrow>
            <h2 id="categories-title" className="t-display t-h2 mt-4">
              Pick your <span className="text-bryant-gold-light">plate.</span>
            </h2>
          </div>
          <p className="max-w-[40ch] text-[17px] leading-relaxed text-bryant-smoke">
            Vehicles will be displayed across seven distinct categories, celebrating diversity in automotive excellence. Cars and motorcycles welcome — tap a plate to see the class.
          </p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10" aria-label="Vehicle categories">
          {categories.map((c, i) => {
            const on = c.value === picked;
            return (
              <Reveal as="li" key={c.value} delay={i * 50} className="flex flex-col gap-3">
                <button type="button" className={`plate ${on ? 'is-on' : ''}`} aria-pressed={on ? 'true' : 'false'} onClick={() => setPicked(c.value)}>
                  <span className="sr-only">{c.name}: {c.description}</span>
                  <span className="plate-bolt" style={{ left: '26%' }} aria-hidden="true"></span>
                  <span className="plate-bolt" style={{ right: '26%' }} aria-hidden="true"></span>
                  <span className="plate-sticker" aria-hidden="true">{pad2(i + 1)}</span>
                  <span className="plate-tag" aria-hidden="true">
                    <span className="plate-tag-long">BRYANT UNIVERSITY</span>
                    <span className="plate-tag-short">BRYANT</span>
                  </span>
                  <span className="plate-code" aria-hidden="true">{c.code}</span>
                  <span className="plate-tag" aria-hidden="true">CAR SHOW · 2027</span>
                </button>
                <span className={`text-[15px] font-bold transition-colors duration-200 sm:text-[16px] ${on ? 'text-bryant-gold-pale' : 'text-bryant-mist'}`} aria-hidden="true">
                  {c.name}
                </span>
              </Reveal>
            );
          })}
          <li className="col-span-2 lg:col-span-1">
            <div className="chamfer-tr flex h-full min-h-[164px] flex-col justify-between gap-4 bg-bryant-gold-light p-5 text-bryant-ink" aria-live="polite">
              <div className="flex flex-col gap-1.5">
                <span className="t-label text-[10px]">Class {pad2(idx + 1)}</span>
                <span className="t-display text-[28px] leading-[.95]">{sel.name}</span>
                <span className="text-[14px] leading-snug">{sel.description}</span>
              </div>
              <button
                type="button"
                onClick={() => onPick(sel.value)}
                className="inline-flex min-h-[44px] items-center gap-2 self-start border-b-2 border-bryant-ink text-[12px] font-extrabold uppercase tracking-[.14em] [font-stretch:112%] focus-visible:outline-bryant-ink"
              >
                Register in this class
                <Arrow className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Register: race entry with start lights                              */
/* ------------------------------------------------------------------ */

function Register({ data, setData, flash, finishRef }) {
  const [status, submit, finishNow] = useSubmitFlow(() => setData(EMPTY_REG));
  if (finishRef) finishRef.current = finishNow;
  useRefocusAfterReset(status, 'reg-firstName');

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const done = status === 'done';
  const steps = [
    { label: 'Name', done: !!(data.firstName.trim() && data.lastName.trim()) },
    { label: 'Email', done: /\S+@\S+\.\S+/.test(data.email) },
    { label: 'Year', done: /^\d{4}$/.test(data.vehicleYear.trim()) },
    { label: 'Car', done: !!(data.vehicleMake.trim() && data.vehicleModel.trim()) },
    { label: 'Class', done: !!data.category }
  ];
  const lit = steps.map((s) => !done && s.done);
  const count = lit.filter(Boolean).length;
  const car = [data.vehicleYear, data.vehicleMake, data.vehicleModel].map((v) => v.trim()).filter(Boolean).join(' ');
  const cat = categories.find((c) => c.value === data.category);

  return (
    <section id="register" aria-labelledby="register-title" className="bg-bryant-night py-24 text-bryant-bone md:py-32">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-14">
          <div className="flex flex-col lg:col-span-5">
            <Reveal>
              <Eyebrow index="06">Vehicle Registration</Eyebrow>
              <h2 id="register-title" className="t-display t-h2 mt-4">
                Enter{' '}<br /><span className="text-bryant-gold-light">the show.</span>
              </h2>
              <p className="t-lead mt-6 text-bryant-smoke">
                Register your vehicle to be part of this premier automotive showcase. Fill each step and watch the lights come on.
              </p>
            </Reveal>

            <Reveal delay={100} className="mt-10">
              <StartLights large lit={lit} label={done ? 'Lights out: registration submitted' : `${count} of 5 start lights on`} />
              <ol className="ml-[7px] mt-3 flex gap-[6px] sm:ml-[9px] sm:gap-2" aria-label="Registration steps">
                {steps.map((s, i) => (
                  <li key={s.label} className={`flex w-[40px] justify-center whitespace-nowrap text-[9px] font-semibold uppercase tracking-[.12em] [font-stretch:112%] sm:w-[56px] sm:text-[10px] ${lit[i] ? 'text-bryant-bone' : 'text-bryant-label'}`}>
                    {s.label}
                    <span className="sr-only">{s.done ? ': complete' : ': not yet'}</span>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={160} className="mt-10 border-t border-[rgba(179,154,90,.6)] pt-5 lg:mt-auto">
              <div className="t-label flex justify-between text-[11px] text-bryant-gold-light">
                <span>Entry</span>
                <span className="tnum">{done ? 'Lights out' : `${count} / 5 lights`}</span>
              </div>
              <p className={`t-display mt-2 line-clamp-2 break-words leading-[.95] ${car ? 'text-bryant-bone' : 'text-bryant-label'}`} style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}>
                {car || 'Your car here'}
              </p>
              <p className="t-label mt-2 text-[13px] text-bryant-smoke">{cat ? cat.name : 'Choose a class'}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal className="chamfer-tr min-h-[600px] border border-[#222] bg-[#111] p-5 sm:p-9">
              {done ? (
                <SuccessState
                  kicker="Lights out"
                  title="Registration Submitted!"
                  body="Thank you for registering. We'll be in touch soon with more details."
                />
              ) : (
                <form onSubmit={submit} aria-labelledby="register-title">
                  <fieldset className="m-0 border-0 p-0">
                    <FormLegend>01 — Driver</FormLegend>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="reg-firstName" name="firstName" label="First Name" required autoComplete="given-name" value={data.firstName} onChange={onChange} />
                      <Field id="reg-lastName" name="lastName" label="Last Name" required autoComplete="family-name" value={data.lastName} onChange={onChange} />
                      <Field id="reg-email" name="email" type="email" label="Email" required autoComplete="email" errMsg="Please enter a valid email." value={data.email} onChange={onChange} />
                      <Field id="reg-phone" name="phone" type="tel" label="Phone" autoComplete="tel" value={data.phone} onChange={onChange} />
                    </div>
                  </fieldset>

                  <fieldset className="m-0 mt-9 border-0 p-0">
                    <FormLegend>02 — Vehicle</FormLegend>
                    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-5 sm:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)]">
                      <Field id="reg-year" name="vehicleYear" label="Year" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} errMsg="Enter a 4-digit year." value={data.vehicleYear} onChange={onChange} />
                      <Field id="reg-make" name="vehicleMake" label="Make" required value={data.vehicleMake} onChange={onChange} />
                      <Field id="reg-model" name="vehicleModel" label="Model" required className="col-span-2 sm:col-span-1" value={data.vehicleModel} onChange={onChange} />
                    </div>
                  </fieldset>

                  <fieldset className="m-0 mt-9 border-0 p-0">
                    <FormLegend>03 — Class</FormLegend>
                    <SelectField
                      id="reg-category"
                      name="category"
                      label="Category"
                      required
                      placeholder="Select a category"
                      errMsg="Please choose a category."
                      options={categories.map((c) => ({ value: c.value, label: c.name }))}
                      value={data.category}
                      onChange={onChange}
                      flashKey={flash ? flash.n : null}
                    />
                  </fieldset>

                  <fieldset className="m-0 mt-9 border-0 p-0">
                    <FormLegend>04 — Notes</FormLegend>
                    <Field id="reg-comments" name="comments" label="Additional Comments" textarea rows={4} value={data.comments} onChange={onChange} />
                  </fieldset>

                  <SubmitButton status={status} label="Submit registration" />
                  <p className="mt-4 text-[13px] text-bryant-mist">
                    Questions? <a href={`mailto:${EMAIL}`} className="u-static text-bryant-smoke hover:text-white">{EMAIL}</a>
                  </p>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sponsors: pit garages                                               */
/* ------------------------------------------------------------------ */

function Sponsors({ data, setData }) {
  const [status, submit] = useSubmitFlow(() => setData(EMPTY_SPONSOR));
  useRefocusAfterReset(status, 'sp-company');

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleLevel = (value) => {
    setData((prev) => ({ ...prev, sponsorshipLevel: prev.sponsorshipLevel === value ? '' : value }));
  };

  const done = status === 'done';
  const chosen = sponsorLevels.find((l) => l.value === data.sponsorshipLevel);

  return (
    <section id="sponsors" aria-labelledby="sponsors-title" className="relative isolate bg-bryant-night py-24 text-bryant-bone md:py-32">
      <div className="checker-sm absolute inset-x-0 top-0 h-3" aria-hidden="true"></div>
      <div className="wrap">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-14">
          <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <Eyebrow index="07">Sponsorship</Eyebrow>
            <h2 id="sponsors-title" className="t-display t-h2 mt-4">
              Partner with{' '}<br /><span className="text-bryant-gold-light">the show.</span>
            </h2>
            <p className="t-lead mt-6 text-bryant-smoke">
              Support the Bryant University Car Show and connect with our community. Pick a garage, then send your inquiry.
            </p>
            <p className="mt-4 text-[15px] text-bryant-mist">
              Prefer email?{' '}
              <a href={`mailto:${EMAIL}`} className="u-static font-semibold text-bryant-gold-pale hover:text-white">{EMAIL}</a>
            </p>
          </Reveal>

          <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <div className="t-label flex items-center justify-between gap-4 text-[11px]">
              <span className="text-bryant-label">Pit lane · 6 garages</span>
              <span className="text-right text-bryant-gold-light" aria-live="polite">{chosen ? `Garage open · ${chosen.label}` : 'Tap a garage'}</span>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-3.5" aria-label="Sponsorship levels">
              {sponsorLevels.map((l, i) => {
                const open = l.value === data.sponsorshipLevel;
                return (
                  <Reveal as="li" key={l.value} delay={i * 60} className="flex flex-col">
                    <button
                      type="button"
                      className={`garage h-[210px] sm:h-[270px] lg:h-[300px] ${open ? 'is-open' : ''}`}
                      aria-pressed={open ? 'true' : 'false'}
                      aria-label={`Garage ${i + 1}: ${l.label}`}
                      onClick={() => toggleLevel(l.value)}
                      disabled={done}
                    >
                      <span className="flex h-12 flex-none items-center gap-2.5 border-b-[3px] border-bryant-gold-light bg-bryant-carbon px-3 sm:h-14 sm:gap-3 sm:px-4">
                        <span className="text-[20px] font-black italic text-bryant-gold-light sm:text-[26px]">{pad2(i + 1)}</span>
                        <span className="truncate text-[11px] font-extrabold uppercase tracking-[.16em] [font-stretch:112%] sm:text-[12px]">{l.short}</span>
                      </span>
                      <span className="relative block flex-1 overflow-hidden">
                        <span className="garage-interior">
                          <span className="t-label text-[10px] text-bryant-gold-pale">Level of interest</span>
                          <span className="t-display text-[26px] leading-[.9] sm:text-[32px]">{l.label}</span>
                        </span>
                        <span className="garage-door" aria-hidden="true"><i></i></span>
                      </span>
                    </button>
                    <span className="pitlane" aria-hidden="true"></span>
                  </Reveal>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <Reveal className="chamfer-tr border border-[#222] bg-[#111] p-5 sm:p-8">
              {done ? (
                <SuccessState
                  kicker="Partnership"
                  title="Inquiry Submitted!"
                  body="Thank you for your interest. We'll contact you soon to discuss partnership opportunities."
                  minH="min-h-[460px]"
                />
              ) : (
                <form onSubmit={submit} aria-labelledby="sponsors-title">
                  <div className="grid grid-cols-1 gap-5">
                    <Field id="sp-company" name="companyName" label="Company Name" required autoComplete="organization" value={data.companyName} onChange={onChange} />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="sp-contact" name="contactName" label="Contact Name" required autoComplete="name" value={data.contactName} onChange={onChange} />
                      <Field id="sp-email" name="email" type="email" label="Email" required autoComplete="email" errMsg="Please enter a valid email." value={data.email} onChange={onChange} />
                      <Field id="sp-phone" name="phone" type="tel" label="Phone" autoComplete="tel" value={data.phone} onChange={onChange} />
                      <SelectField
                        id="sp-level"
                        name="sponsorshipLevel"
                        label="Level of Interest"
                        placeholder="Select a level"
                        options={sponsorLevels.map((l) => ({ value: l.value, label: l.label }))}
                        value={data.sponsorshipLevel}
                        onChange={onChange}
                      />
                    </div>
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
                  </div>
                  <SubmitButton status={status} label="Submit inquiry" />
                </form>
              )}
            </Reveal>
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
    <footer ref={footerRef} className="bg-black pb-28 text-bryant-bone md:pb-10">
      <div className="checker h-3" aria-hidden="true"></div>
      <div className="wrap pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <BrandLockup size={48} lazy />
            <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-bryant-mist">
              Celebrating automotive excellence and bringing together the Bryant community through our shared passion for cars.
            </p>
          </div>

          <div>
            <h2 className="t-label text-bryant-gold-light">Visit</h2>
            <address className="mt-5 text-[15px] not-italic leading-relaxed text-bryant-mist">
              Bryant University<br />
              1150 Douglas Pike<br />
              Smithfield, RI 02917
            </address>
          </div>

          <div>
            <h2 className="t-label text-bryant-gold-light">Connect</h2>
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
            <h2 className="t-label text-bryant-gold-light">Navigate</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 lg:grid-cols-1">
              {MENU_LINKS.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className={linkCls}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-20 border-t-2 border-bryant-gold-light pt-8" aria-hidden="true">
          <svg className="wordmark select-none" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMid meet" focusable="false">
            <defs>
              <linearGradient id="wm-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#B39A5A" stopOpacity=".6" />
                <stop offset="1" stopColor="#826E38" stopOpacity=".08" />
              </linearGradient>
            </defs>
            <text x="0" y="100" fontSize="128" textLength="976" lengthAdjust="spacingAndGlyphs" fill="url(#wm-grad)">
              BRYANT CAR SHOW 2027
            </text>
          </svg>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-[13px] tracking-[.04em] text-bryant-mist sm:flex-row sm:items-center">
          <p>© 2027 Bryant University Car Club. Est. 2026. All rights reserved.</p>
          <button type="button" onClick={backToTop} className="u-link t-label min-h-[44px] self-start text-[11px] text-bryant-mist transition-colors duration-200 hover:text-white sm:self-auto">
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
      <a href="#register" tabIndex={show ? 0 : -1} className="btn btn-gold chamfer-sm h-12 flex-1">
        Register
        <Arrow />
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
    <div className="min-h-screen bg-bryant-night font-sans text-white">
      <SkipLink />
      <ScrollProgress />
      <Nav active={active} menuOpen={menuOpen} onToggle={toggleMenu} toggleRef={toggleRef} />
      <MobileMenu open={menuOpen} onClose={closeMenu} toggleRef={toggleRef} />

      <main id="main" ref={mainRef} tabIndex={-1}>
        <Hero />
        <About />
        <Cluster />
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
