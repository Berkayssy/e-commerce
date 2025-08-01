import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// LuxuryIcon component for premium icon display
function LuxuryIcon({ icon, size = 38, gradient = true, svg = null }) {
  if (svg) {
    return (
      <span
        className={gradient ? 'luxury-icon luxury-icon-gradient' : 'luxury-icon'}
        style={{ width: size, height: size, fontSize: size * 0.7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {svg}
      </span>
    );
  }
  return (
    <span
      className={gradient ? 'luxury-icon luxury-icon-gradient' : 'luxury-icon'}
      style={{ width: size, height: size, fontSize: size * 0.7 }}
    >
      {icon}
    </span>
  );
}

// SVG Wave Divider
function LuxuryWaveDivider({ flip = false }) {
  return (
    <div className={flip ? 'luxury-wave-divider luxury-wave-divider-flip' : 'luxury-wave-divider'}>
      <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{width:'100%',height:'32px',display:'block'}}>
        <defs>
          <linearGradient id="luxuryWaveGradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f7e7c3" stopOpacity="0.18" />
            <stop offset="0.5" stopColor="#cbb6f7" stopOpacity="0.18" />
            <stop offset="1" stopColor="#232946" stopOpacity="0.18" />
          </linearGradient>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        <path d="M0,20 C360,0 1080,32 1440,20 L1440,32 L0,32 Z" fill="url(#luxuryWaveGradient)" filter="url(#blur)" />
        <rect x="0" y="22" width="1440" height="10" fill="#fff" fillOpacity="0.07" filter="url(#blur)" />
        <rect x="0" y="26" width="1440" height="6" fill="#cbb6f7" fillOpacity="0.06" filter="url(#blur)" />
      </svg>
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <div className="section-title-accent fade-in" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.7rem',marginBottom:'1.2rem'}}>
      {icon && <LuxuryIcon icon={icon} size={32} />}
      <h2 className="section-title" style={{margin:0}}>{children}</h2>
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const scrollToNext = () => {
    const next = document.getElementById('why-galeria');
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  };
  // Minimal Galeria diamond SVG
  const diamondSVG = (
    <svg viewBox="0 0 32 32" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diamondGradHero" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f7c873" />
          <stop offset="0.5" stopColor="#c084fc" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <polygon points="16,4 28,12 16,28 4,12" fill="url(#diamondGradHero)" stroke="#fff" strokeWidth="1.2" />
      <polygon points="16,8 24,13 16,24 8,13" fill="#fff" fillOpacity="0.18" />
    </svg>
  );
  return (
    <section
      className="hero-section"
      tabIndex={-1}
      aria-label="Welcome"
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 0.5rem',
        margin: 0,
        width: '100vw',
        position: 'relative',
        textAlign: 'center',
      }}
    >
      <div style={{marginBottom: '1.1rem', animation: 'fadeInUp 1.1s cubic-bezier(.4,0,.2,1) 0.1s both'}}>
        <LuxuryIcon svg={diamondSVG} size={48} gradient={false} />
      </div>
      <h1
        className="hero-title-luxury fade-in"
        style={{
          fontSize: '2.7rem',
          fontWeight: 900,
          marginBottom: '0.7rem',
          lineHeight: 1.13,
          letterSpacing: '0.01em',
          background: 'linear-gradient(90deg, #f7c873 0%, #c084fc 60%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          position: 'relative',
          animation: 'fadeInUp 1.2s cubic-bezier(.4,0,.2,1) 0.2s both',
        }}
      >
        The New Standard for Luxury Asset Sales
      </h1>
      <div
        className="hero-tagline fade-in"
        style={{
          fontSize: '1.18rem',
          color: '#f7c873',
          fontWeight: 600,
          marginBottom: '0.7rem',
          animation: 'fadeInUp 1.2s cubic-bezier(.4,0,.2,1) 0.35s both',
        }}
      >
        A new era for luxury asset sales
      </div>
      <div
        className="hero-desc fade-in"
        style={{
          color: '#cbd5e1',
          fontSize: '1.09rem',
          marginBottom: '1.2rem',
          animation: 'fadeInUp 1.2s cubic-bezier(.4,0,.2,1) 0.5s both',
        }}
      >
        Galeria is the next-generation platform for luxury asset sales. Manage, showcase, and sell rare vehicles, yachts, and collectibles with unmatched security and global reach.
      </div>
      <div className="hero-cta-row fade-in" style={{gap:'1.1rem',marginTop:'0.7rem',animation: 'fadeInUp 1.2s cubic-bezier(.4,0,.2,1) 0.7s both'}}>
        <button
          className="luxury-btn"
          style={{ boxShadow: '0 0 0 0 #f7c873', transition: 'box-shadow 0.22s', fontWeight: 700, marginRight: '0.5rem' }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 16px 2px #f7c87388'}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 0 0 0 #f7c873'}
          onClick={() => navigate('/communities')}
        >
          Explore Stores
        </button>
        <button
          className="luxury-btn"
          style={{ background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1.5px solid #c084fc', fontWeight: 700, boxShadow: '0 0 0 0 #c084fc', transition: 'box-shadow 0.22s' }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 16px 2px #c084fc88'}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 0 0 0 #c084fc'}
          onClick={() => navigate('/plans')}
        >
          Create Your Store
        </button>
      </div>
      <div className="hero-scroll-down fade-in" onClick={scrollToNext} title="Scroll Down" style={{marginTop:'2.2rem',animation: 'fadeInUp 1.2s cubic-bezier(.4,0,.2,1) 1s both'}}>
        <LuxuryIcon svg={
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="arrowDownGradient" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f7c873" />
                <stop offset="0.5" stopColor="#c084fc" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
              <filter id="arrowShadow" x="-2" y="-2" width="32" height="32">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#c084fc" floodOpacity="0.18" />
              </filter>
            </defs>
            <path d="M7 12L14 19L21 12" stroke="url(#arrowDownGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#arrowShadow)"/>
          </svg>
        } size={28} gradient={false} />
      </div>
    </section>
  );
}

function WhyGaleriaSection() {
  const points = [
    {
      icon: '💎',
      title: 'Unified Dashboard',
      desc: 'Manage all luxury asset types—cars, yachts, collectibles—on a single, intuitive platform. No more juggling multiple tools.',
      align: 'flex-start',
    },
    {
      icon: '🏆',
      title: 'End-to-End Management',
      desc: 'From listing to logistics, handle offers, contracts, and delivery with seamless, automated workflows.',
      align: 'center',
    },
    {
      icon: '🛡️',
      title: 'Enterprise-Grade Security',
      desc: 'KYC, audit trails, and advanced encryption protect your business and clients at every step.',
      align: 'flex-end',
    },
    {
      icon: '🌍',
      title: 'Global Compliance',
      desc: 'Operate internationally with built-in legal, tax, and language support for cross-border sales.',
      align: 'center',
    },
  ];
  return (
    <section className="features-section" id="why-galeria" aria-label="Why Galeria" style={{paddingTop:'3rem',paddingBottom:'2.5rem',position:'relative'}}>
      <SectionTitle icon="👑">Why Choose Galeria?</SectionTitle>
      <div style={{color:'#a8b2ff',fontSize:'1.13rem',marginBottom:'1.1rem',maxWidth:600,marginLeft:'auto',marginRight:'auto',textAlign:'center',fontWeight:600}}>Galeria is trusted by the world’s most exclusive dealerships for its unified, secure, and global-first approach to luxury asset sales.</div>
      <div className="features-grid why-galeria-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'2rem',maxWidth:700,margin:'0 auto'}}>
        {points.map((p, i) => {
          // Kart hizalama ve padding ayarları
          let alignItems = p.align;
          let textAlign = p.align === 'center' ? 'center' : p.align === 'flex-end' ? 'right' : 'left';
          let paddingStyle = {};
          if (i === 0) paddingStyle = {paddingLeft: '2.2rem'};
          if (i === 2) paddingStyle = {paddingRight: '2.2rem'};
          return (
            <div
              key={i}
              className={`why-galeria-card fade-in`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems,
                justifyContent: 'flex-start',
                background: 'rgba(34,39,56,0.85)',
                borderRadius: '1.5rem',
                padding: '2.1rem 1.5rem',
                boxShadow: '0 4px 24px 0 rgba(129,140,248,0.10)',
                transition: 'box-shadow 0.2s, background 0.2s',
                minHeight: 210,
                cursor: 'pointer',
                textAlign,
                border: '1.5px solid #232946',
                ...paddingStyle,
              }}
            >
              <div style={{marginBottom:'1.1rem',alignSelf:p.align}}>
                <LuxuryIcon icon={p.icon} size={48} />
              </div>
              <div style={{fontWeight:900,fontSize:'1.25rem',marginBottom:'0.5rem',color:'#f7c873',letterSpacing:'0.01em'}}>{p.title}</div>
              <div style={{color:'#cbd5e1',fontSize:'1.08rem',fontWeight:500,marginBottom:'0.2rem',lineHeight:1.6}}>{p.desc}</div>
            </div>
          );
        })}
      </div>
      <LuxuryWaveDivider />
    </section>
  );
}

function PlatformFeaturesSection() {
  const features = [
    { icon: '🚘', title: 'Inventory Management', desc: 'Organize by brand, type, country, and price with enterprise precision.' },
    { icon: '📝', title: 'Digital Contracts', desc: 'Multi-language, signable, exportable as PDF—fully compliant.' },
    { icon: '🚚', title: 'Logistics Integration', desc: 'Connect with global transport and offer systems for any asset.' },
    { icon: '🧠', title: 'AI Price Estimation', desc: 'Accurate, data-driven pricing for every market.' },
    { icon: '🌐', title: 'Multi-Currency & Language', desc: 'Sell globally, operate locally—seamlessly.' },
    { icon: '🏷️', title: 'White-Label Showroom', desc: 'Your own branded digital presence, instantly.' },
  ];
  return (
    <section className="features-section" id="platform-features" aria-label="Platform Features" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem',position:'relative'}}>
      <SectionTitle icon="💎">Platform Features</SectionTitle>
      <div className="features-grid pf-4grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'2.2rem',maxWidth:1200,margin:'1.5rem auto 0 auto',justifyItems:'center',alignItems:'stretch'}}>
        {features.map((f, i) => (
          <div className="feature-card pf-card fade-in" key={i} tabIndex={0} aria-label={f.title} style={{borderRadius:'2rem',padding:'2.2rem 1.2rem',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px 0 rgba(129,140,248,0.13)'}}>
            <LuxuryIcon icon={f.icon} size={38} />
            <h3 style={{fontWeight:800,marginBottom:'0.5rem',marginTop:'1.1rem',fontSize:'1.15rem'}}>{f.title}</h3>
            <p style={{color:'#cbd5e1',fontSize:'1.01rem'}}>{f.desc}</p>
          </div>
        ))}
      </div>
      <LuxuryWaveDivider flip />
    </section>
  );
}

function WhoIsItForSection() {
  const targets = [
    { icon: '🏛️', label: 'Luxury Car Dealerships' },
    { icon: '🛥️', label: 'Yacht & Jet Sellers' },
    { icon: '🏍️', label: 'Collectible & Motorcycle Galleries' },
    { icon: '🚜', label: 'Heavy Machinery & Fleet Dealers' },
    { icon: '🏢', label: 'Corporate Dealership Chains' },
    { icon: '🤝', label: 'Mobile Showrooms & Brokers' },
  ];
  return (
    <section className="info-section" id="who-for" aria-label="Who Is It For?" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem',position:'relative'}}>
      <SectionTitle icon="🏆">Who Is Galeria For?</SectionTitle>
      <div className="info-cards-grid who-for-3grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2rem',maxWidth:1000,margin:'1.2rem auto 0 auto',justifyItems:'center',alignItems:'stretch'}}>
        {targets.map((t, i) => (
          <div className="info-card pf-card fade-in" key={i} tabIndex={0} aria-label={t.label} style={{borderRadius:'2rem',padding:'2.2rem 1.2rem',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px 0 rgba(129,140,248,0.13)'}}>
            <LuxuryIcon icon={t.icon} size={32} />
            <span style={{marginTop:'0.7rem',fontSize:'1.08rem',fontWeight:700}}>{t.label}</span>
          </div>
        ))}
      </div>
      <LuxuryWaveDivider />
    </section>
  );
}

function SecuritySection() {
  const items = [
    { icon: '🛡️', text: 'KYC-backed user verification' },
    { icon: '🧾', text: 'Transaction history and audit trail' },
    { icon: '🏅', text: 'User scoring and secure dealer matching' },
    { icon: '🔐', text: 'Advanced encryption and server security' },
  ];
  return (
    <section className="features-section" id="security" aria-label="Security" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem',position:'relative'}}>
      <SectionTitle icon="🛡️">Security & Trust</SectionTitle>
      <div style={{color:'#a8b2ff',fontSize:'1.08rem',marginBottom:'1.1rem',maxWidth:520,marginLeft:'auto',marginRight:'auto',textAlign:'center'}}>Your data and transactions are protected with the highest industry standards.</div>
      <div className="security-2grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'2rem',maxWidth:700,margin:'0 auto'}}>
        {items.map((item, i) => (
          <div key={i} className="security-card fade-in" style={{display:'flex',alignItems:'center',gap:'1.1rem',fontSize:'1.08rem',color:'#cbd5e1',background:'#232946',borderRadius:'0.7rem',padding:'2rem 1.5rem',boxShadow:'0 2px 12px 0 rgba(129,140,248,0.07)',border:'1.5px solid #232946',textAlign:'left'}}>
            <LuxuryIcon icon={item.icon} size={32} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <LuxuryWaveDivider flip />
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      icon: '✨',
      quote: 'Galeria transformed our sales process. The platform is secure, intuitive, and truly global.',
      name: 'John M.',
      title: 'CEO, Prestige Motors',
    },
    {
      icon: '🥇',
      quote: 'With Galeria, we manage inventory and contracts across continents with ease. Highly recommended.',
      name: 'Sophie L.',
      title: 'Director, Elite Yachts',
    },
    {
      icon: '🗣️',
      quote: 'The support and technology are world-class. Our dealership network has never been stronger.',
      name: 'Carlos R.',
      title: 'Managing Partner, Global Auto Group',
    },
  ];
  const [active, setActive] = useState(0);
  const handlePrev = () => setActive((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const handleNext = () => setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  return (
    <section className="testimonials-section" id="testimonials" aria-label="Testimonials" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem',position:'relative'}}>
      <SectionTitle icon="💬">What Our Partners Say</SectionTitle>
      <div className="testimonials-single-card-grid" style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:'1.5rem',maxWidth:1100,padding:'0 1.2rem',margin:'0 auto',position:'relative'}}>
        <button className="testimonial-arrow left" onClick={handlePrev} aria-label="Previous testimonial" style={{position:'absolute',left:'2rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'2rem',color:'#c084fc',zIndex:2}}>&#8592;</button>
        <div className="testimonial-card pf-card fade-in" style={{borderRadius:'2.5rem',padding:'2.7rem 2.2rem',textAlign:'center',maxWidth:700,width:'100%',margin:'0 auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px 0 rgba(129,140,248,0.13)'}}>
          <LuxuryIcon icon={testimonials[active].icon} size={38} />
          <div style={{fontSize:'1.18rem',color:'#e2e8f0',margin:'1.1rem 0 0.7rem 0',fontStyle:'italic',fontWeight:500}}>&ldquo;{testimonials[active].quote}&rdquo;</div>
          <div style={{fontWeight:700,color:'#c084fc',fontSize:'1.08rem'}}>{testimonials[active].name}</div>
          <div style={{fontSize:'0.97rem',color:'#a8b2ff'}}>{testimonials[active].title}</div>
        </div>
        <button className="testimonial-arrow right" onClick={handleNext} aria-label="Next testimonial" style={{position:'absolute',right:'2rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'2rem',color:'#c084fc',zIndex:2}}>&#8594;</button>
      </div>
      <LuxuryWaveDivider />
    </section>
  );
}

function PricingSection() {
  const plans = [
    { icon: '💼', name: 'Basic', desc: 'For small dealerships. Essential features, up to 10 listings, community support.' },
    { icon: '💎', name: 'Pro', desc: 'For growing operations. Unlimited listings, advanced analytics, priority support.' },
    { icon: '🏆', name: 'Elite', desc: 'For luxury professionals. White-glove onboarding, global promotion, API access.' },
    { icon: '🏢', name: 'Enterprise', desc: 'For corporate chains. Tailored solutions, dedicated manager, custom integrations.' },
  ];
  const navigate = useNavigate();
  return (
    <section className="plans-section" id="pricing" aria-label="Pricing" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem',position:'relative'}}>
      <SectionTitle icon="💰">Pricing Plans</SectionTitle>
      <div className="plans-brief-grid pricing-4grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'2.2rem',maxWidth:1200,margin:'1.5rem auto 0 auto',justifyItems:'center',alignItems:'stretch'}}>
        {plans.map((plan, i) => (
          <div className="plan-brief-card pf-card fade-in" key={i} tabIndex={0} aria-label={plan.name} style={{borderRadius:'2rem',padding:'2.2rem 1.2rem',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px 0 rgba(129,140,248,0.13)'}}>
            <LuxuryIcon icon={plan.icon} size={32} />
            <div className="plan-brief-title" style={{fontWeight:800,marginBottom:'0.3rem',marginTop:'0.7rem'}}>{plan.name}</div>
            <div className="plan-brief-list" style={{color:'#cbd5e1',fontSize:'0.99rem',marginBottom:'0.7rem'}}>{plan.desc}</div>
            <button className="plan-btn luxury-btn" style={{marginTop:'0.5rem'}} onClick={() => navigate('/plans')}><LuxuryIcon icon="📩" size={18} gradient={false} /> Create Your Store</button>
          </div>
        ))}
      </div>
      <LuxuryWaveDivider flip />
    </section>
  );
}

function GlobalNetworkSection() {
  return (
    <section className="info-section" id="global-network" aria-label="Global Network" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem',position:'relative'}}>
      <SectionTitle icon="🌍">A Global Network, Built for the Future</SectionTitle>
      <div className="global-network-single-card-grid" style={{display:'flex',justifyContent:'center',alignItems:'center',margin:'1.2rem auto',maxWidth:1200,marginLeft:'auto',marginRight:'auto'}}>
        <div className="global-network-card fade-in" style={{fontSize:'1.18rem',textAlign:'center',width:'100%',maxWidth:900,background:'#232946',borderRadius:'1.1rem',padding:'2.7rem 2.2rem',boxShadow:'0 8px 32px 0 rgba(129,140,248,0.13)',margin:'0 auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <LuxuryIcon icon="🚀" size={38} />
          <div style={{marginTop:'1.1rem'}}><b>Galeria</b> is building the world’s most advanced luxury asset sales ecosystem, connecting over <b>20,000</b> premium dealerships worldwide.</div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  const showcases = [
    {
      title: 'Luxury Marketplace',
      desc: 'Discover and list rare vehicles, yachts, and collectibles in a curated, global luxury marketplace. Every listing is verified for authenticity.',
      img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80', // Lüks araç galerisi
      align: 'left',
    },
    {
      title: 'Dealer Tools',
      desc: 'Advanced analytics, CRM, and marketing tools designed for luxury dealerships. Grow your business with actionable insights and automation.',
      img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80', // Modern dashboard/teknoloji
      align: 'right',
    },
  ];
  return (
    <section className="showcase-section" id="showcase" aria-label="Showcase" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem',position:'relative',background:'#181c2a'}}>
      <SectionTitle icon="🌟">Showcase</SectionTitle>
      <div className="showcase-grid">
        {showcases.map((s, i) => (
          <div className={`showcase-item showcase-item-${s.align} fade-in`} key={i} style={{display:'flex',flexDirection: s.align==='left' ? 'row' : 'row-reverse',alignItems:'center',background:'#232946',borderRadius:'1.1rem',boxShadow:'0 4px 24px 0 rgba(129,140,248,0.10)',marginBottom:'2.2rem',overflow:'hidden',minHeight:220}}>
            <img src={s.img} alt={s.title} style={{width: '38%', height: '100%', objectFit: 'cover', minHeight: 180}} />
            <div style={{flex:1,padding:'2.2rem 2rem',display:'flex',flexDirection:'column',alignItems: s.align==='left' ? 'flex-start' : 'flex-end',justifyContent:'center'}}>
              <h3 style={{fontWeight:900,fontSize:'1.35rem',marginBottom:'0.7rem',color:'#f7c873',textAlign: s.align==='left' ? 'left' : 'right'}}>{s.title}</h3>
              <p style={{color:'#cbd5e1',fontSize:'1.08rem',textAlign: s.align==='left' ? 'left' : 'right',maxWidth:420}}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Header() {
  const navigate = useNavigate();
  // Minimal Galeria diamond SVG (navbar için parıltı eklendi)
  const diamondSVG = (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px #f7c87388) drop-shadow(0 0 4px #c084fc66)' }}>
      <defs>
        <linearGradient id="diamondGradNav" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f7c873" />
          <stop offset="0.5" stopColor="#c084fc" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <polygon points="16,4 28,12 16,28 4,12" fill="url(#diamondGradNav)" stroke="#fff" strokeWidth="1.2" />
      <polygon points="16,8 24,13 16,24 8,13" fill="#fff" fillOpacity="0.18" />
    </svg>
  );
  return (
    <nav className="home-navbar" role="navigation" aria-label="Main Navigation">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="galeria-logo">
            <LuxuryIcon svg={diamondSVG} size={28} gradient={false} />
          </span>
          <span className="logo-text">Galeria</span>
        </div>
        <div className="nav-links">
          <a href="#why-galeria">Why Galeria</a>
          <a href="#platform-features">Features</a>
          <a href="#who-for">Who For?</a>
          <a href="#security">Security</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#pricing">Pricing</a>
          <a href="#global-network">Network</a>
        </div>
        <div className="nav-auth">
          {/* Login ve Register butonları kaldırıldı */}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const navigate = useNavigate();
  // SVG ikonlar
  const icons = {
    instagram: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M16.5 7.5h.01"/><circle cx="12" cy="12" r="5"/></svg>
    ),
    x: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 6.5l-11 11"/><path d="M6.5 6.5l11 11"/></svg>
    ),
    linkedin: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="4"/><path d="M8 11v5"/><path d="M8 8v.01"/><path d="M12 16v-5"/><path d="M16 16v-3a2 2 0 0 0-4 0"/></svg>
    ),
    youtube: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="6.5" width="19" height="11" rx="4"/><path d="M10 9.5l5 2.5-5 2.5z"/></svg>
    ),
  };
  return (
    <footer className="home-footer" aria-label="Footer" style={{position:'relative',overflow:'hidden',marginTop:'2.5rem'}}>
      <div style={{position:'absolute',top:0,left:0,width:'100%',height:'8px',background:'linear-gradient(90deg,#818cf8,#c084fc,#f472b6)',opacity:0.7}} />
      <div className="footer-about" style={{fontWeight:700,fontSize:'1.08rem',color:'#e2e8f0',marginBottom:'0.7rem',marginTop:'0.7rem'}}>Galeria empowers the world's most exclusive dealerships with secure, seamless, and global luxury asset sales.</div>
      <div className="footer-links" style={{marginBottom:'0.5rem'}}>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <button className="footer-link-btn" style={{background:'none',border:'none',color:'#cbd5e1',fontWeight:800,fontSize:'0.98rem',cursor:'pointer',padding:0,margin:0}} onClick={()=>navigate('/support')}>Support</button>
        <button className="footer-link-btn" style={{background:'none',border:'none',color:'#cbd5e1',fontWeight:800,fontSize:'0.98rem',cursor:'pointer',padding:0,margin:0}} onClick={()=>navigate('/contact')}>Contact</button>
      </div>
      <div className="footer-socials" style={{display:'flex',justifyContent:'center',gap:'1.2rem',margin:'1.1rem 0'}}>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">{icons.instagram}</a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">{icons.x}</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">{icons.linkedin}</a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">{icons.youtube}</a>
      </div>
      <div className="footer-bottom" style={{marginTop:'0.7rem',fontSize:'0.98rem',color:'#a8b2ff'}}>
        © {new Date().getFullYear()} Galeria. All rights reserved.
        <button className="back-to-top" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{marginLeft:'0.7rem'}}><LuxuryIcon icon="⬆️" size={18} gradient={false} /> Back to Top</button>
      </div>
    </footer>
  );
}

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    // Smooth scroll for anchor links
    const handleClick = (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = e.target.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <WhyGaleriaSection />
      <PlatformFeaturesSection />
      <ShowcaseSection />
      <WhoIsItForSection />
      <SecuritySection />
      <TestimonialsSection />
      <PricingSection />
      <GlobalNetworkSection />
      <Footer />
    </div>
  );
};

export default Home;