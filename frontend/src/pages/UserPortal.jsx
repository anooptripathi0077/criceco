import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getStadium } from "../stadiums";
import "../index.css";

import { backendAPI } from "../services/api";

if (!document.getElementById("premium-font")) {
  const l = document.createElement("link");
  l.id = "premium-font";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(l);
}

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TicketIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const BoltIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const FaceScanIcon = () => (
  <svg
    className="w-7 h-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V6a2 2 0 012-2h2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 4h2a2 2 0 012 2v2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16v2a2 2 0 01-2 2h-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20H5a2 2 0 01-2-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01" strokeWidth={2.5} />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17.5a3.5 3.5 0 005 0" />
  </svg>
);

const HeadsetIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>
);

const FEATURES = [
  {
    icon: <ShieldIcon />,
    title: "100% Secure Booking",
    desc: "Every transaction is encrypted end-to-end. Your payment and personal data are always protected.",
    accent: "#2563eb",
    bg: "#eff6ff",
  },
  {
    icon: <BoltIcon />,
    title: "Instant Confirmation",
    desc: "Get your e-tickets in seconds. No waiting, no queues — straight to your inbox and app.",
    accent: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    icon: <FaceScanIcon />,
    title: "Face Scanner",
    desc: "One tap, walk in. Our smart scanner system work on any screen — no printing needed.",
    accent: "#0891b2",
    bg: "#ecfeff",
  },
  {
    icon: <HeadsetIcon />,
    title: "24/7 Fan Support",
    desc: "Our team is always on standby for cancellations, swaps, or any match-day queries.",
    accent: "#059669",
    bg: "#ecfdf5",
  },
];

export default function UserPortal() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2805&auto=format&fit=crop";

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await backendAPI.get("/matches");

        console.log("STATUS:", response.status);
        console.log("DATA:", response.data);
        console.log("TYPE:", typeof response.data);
        console.log("IS ARRAY:", Array.isArray(response.data));
        const apiData = response.data;
        setMatches(response.data);
        if (apiData && apiData.length > 0) {
          setSelectedMatch(apiData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch matches:", err);
        setError("Unable to load matches at this time. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMatches();
  }, []);

  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scroll = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    // scroll by ~1 card width + gap
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const handleBookNow = () => {
    if (selectedMatch) navigate(`/book/${selectedMatch.id}`);
  };

  const getMatchImage = (match) => {
    if (!match) return DEFAULT_IMAGE;
    return match.image_url && match.image_url.trim() !== "" ? match.image_url : DEFAULT_IMAGE;
  };

  return (
    <div className="min-h-screen bg-[#e2e9f0] font-['Inter',sans-serif] text-slate-900 pb-20">
      <style>{`
        .slider-container::-webkit-scrollbar { display: none; }
        .slider-container { -ms-overflow-style: none; scrollbar-width: none; }

        .portal-root *:focus,
        .portal-root *:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        .hero-img { transition: transform 0.6s ease; }
        .hero-card:hover .hero-img { transform: scale(1.03); }

        .match-card {
          border: 1.5px solid #e2e8f0;
          border-radius: 1rem;
          box-shadow: 0 30px 30px rgba(15, 23, 42, 0.06);
          transition: none;
        }
        .match-card:hover { border-color: #94a3b8; }
        .match-card--selected {
          border: 2px solid #2563eb;
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.15);
        }
        .match-thumb { transition: none; }

        .book-btn { transition: background-color 0.18s ease, box-shadow 0.18s ease; }
        .book-btn:hover {
          background-color: #1d4ed8;
          box-shadow: 0 10px 24px -4px rgba(37, 99, 235, 0.40);
        }

        .feature-card {
          border-radius: 1.25rem;
          border: 1.5px solid #e8edf4;
          background: white;
          box-shadow: 0 2px 12px rgba(15,23,42,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(15,23,42,0.10);
        }

        .vip-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%);
          border-radius: 2rem;
          position: relative;
          overflow: hidden;
        }
        .vip-banner::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%);
        }
        .vip-banner::after {
          content: '';
          position: absolute;
          bottom: -80px; left: 30%;
          width: 250px; height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%);
        }

        /* Arrow buttons */
        .slider-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(15,23,42,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, opacity 0.15s ease;
          flex-shrink: 0;
        }
        .slider-arrow:hover:not(:disabled) {
          background: #1e40af;
          border-color: #1e40af;
          color: white;
          box-shadow: 0 4px 14px rgba(37,99,235,0.30);
        }
        .slider-arrow:disabled {
          opacity: 0.35;
          cursor: default;
        }
      `}</style>

      {/* ── Header ── */}
      <header className="pt-8 pb-12 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Live Ticketing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Select Your <span className="text-blue-600">Match</span>
        </h1>
      </header>

      <main className="portal-root max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Status States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium">Loading matches...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl text-sm font-medium text-center max-w-lg mx-auto">
            {error}
          </div>
        )}
        {!isLoading && !error && matches.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No upcoming matches found.</div>
        )}

        {/* ── 1. HERO CARD ── */}
        {selectedMatch && (
          <section className="mb-10">
            <div
              className="hero-card bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col md:flex-row cursor-default"
              style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)" }}
            >
              <div className="md:w-[55%] h-64 md:h-auto relative bg-slate-100 overflow-hidden">
                <img
                  src={getMatchImage(selectedMatch)}
                  alt={`${selectedMatch.team_a} vs ${selectedMatch.team_b}`}
                  className="hero-img w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>

              <div className="md:w-[45%] p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="inline-block bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
                    Featured Event
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                  {selectedMatch.team_a}{" "}
                  <span className="text-slate-400 font-medium text-2xl mx-1">vs</span>{" "}
                  {selectedMatch.team_b}
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 line-clamp-3">
                  {selectedMatch.description || "Experience the thrill of live cricket. Book your seats now for an unforgettable match-day experience."}
                </p>
                <div className="space-y-3 border-t border-slate-100 pt-6 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CalendarIcon />
                    {new Date(selectedMatch.date).toLocaleDateString("en-IN", {
                      weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                  {getStadium(selectedMatch.stadium_id) && (
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <LocationIcon />
                      {getStadium(selectedMatch.stadium_id).name},{" "}
                      {getStadium(selectedMatch.stadium_id).city}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBookNow}
                  className="book-btn mt-auto flex items-center justify-center w-full md:w-auto bg-blue-600 text-white font-semibold py-4 px-8 rounded-xl"
                  style={{ boxShadow: "0 6px 18px -4px rgba(37,99,235,0.35)" }}
                >
                  <TicketIcon />
                  Book Tickets Now
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── 2. UPCOMING MATCHES (SLIDER) ── */}
        {matches.length > 0 && (
          <section className="mb-16">
            {/* Header row with arrows */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-600 rounded-full" />
                Upcoming Matches
              </h3>
              <div className="flex items-center gap-2">
                <button
                  className="slider-arrow"
                  onClick={() => scroll(-1)}
                  disabled={!canScrollLeft}
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  className="slider-arrow"
                  onClick={() => scroll(1)}
                  disabled={!canScrollRight}
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            <div
              ref={sliderRef}
              onScroll={updateScrollState}
              className="slider-container flex overflow-x-auto gap-5 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x"
            >
              {matches.map((match) => {
                const isSelected = selectedMatch?.id === match.id;
                const stadium = getStadium(match.stadium_id);
                return (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className={`match-card group flex-none w-[280px] snap-start rounded-2xl cursor-pointer overflow-hidden flex flex-col bg-white
                      ${isSelected ? "match-card--selected" : "border border-slate-200"}`}
                  >
                    <div className="h-40 w-full overflow-hidden relative bg-slate-100">
                      <img src={getMatchImage(match)} className="match-thumb w-full h-full object-cover" alt="Thumbnail" />
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-white text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                          Selected
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <h4 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                        {match.team_a}{" "}
                        <span className="text-slate-400 font-normal text-sm">vs</span>{" "}
                        {match.team_b}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {match.description || "Join the excitement and cheer for your favorite team."}
                      </p>
                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <CalendarIcon />
                            {new Date(match.date).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </div>
                          {stadium && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                              <LocationIcon />
                              <span className="truncate">{stadium.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 3. WHY SECURESEAT ── */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Why SecureSeat?</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Built for fans, by fans. Every feature is designed to make match day effortless.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card p-7 flex flex-col gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: f.bg, color: f.accent }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-base">{f.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>



      </main>
    </div>
  );
}