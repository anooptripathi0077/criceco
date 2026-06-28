import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStadium } from "../stadiums";
import StadiumViewer from "../components/StadiumViewer";
import { backendAPI } from "../services/api";
import cricecoSidebarImage from "../assets/secureseat.png";

const CalendarIcon = () => (
  <svg
    className="w-6 h-6 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="w-6 h-6 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export default function BookingPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2805&auto=format&fit=crop";

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setIsLoading(true);
        const response = await backendAPI.get("/matches");
        const foundMatch = response.data.find(
          (m) => String(m.id) === String(matchId),
        );
        if (foundMatch) {
          setMatch(foundMatch);
        } else {
          setError("Match not found.");
        }
      } catch (err) {
        console.error("Failed to fetch match details", err);
        setError("Failed to load match data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatchDetails();
  }, [matchId]);

  if (isLoading) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-32 bg-white min-h-screen"
        style={{ backgroundColor: '#ffffff', colorScheme: 'light' }}
      >
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Preparing event details...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div 
        className="min-h-screen bg-white flex flex-col items-center pt-20"
        style={{ backgroundColor: '#ffffff', colorScheme: 'light' }}
      >
        <div className="max-w-xl w-full mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">
            {error || "Could not load this match."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const stadiumData = getStadium(match.stadium_id);
  const matchLabel = `${match.team_a} vs ${match.team_b} · ${new Date(match.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  const stadiumImage = match.stadium_images || null;

  return (
    /* 🔥 THE FIX: Full screen wrapper forcing pure white and blocking Edge Dark Mode */
    <div 
      className="min-h-screen w-full bg-white font-['Inter',sans-serif] pb-12"
      style={{ backgroundColor: '#ffffff', colorScheme: 'light' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── 1. TOP NAVIGATION ── */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Matches
          </button>
        </div>

        {/* ── 2. CINEMATIC HERO BANNER SECTION ── */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* ── LEFT: The Match Banner (2/3 width) ── */}
          <div className="relative w-full md:w-2/3 h-[35vh] md:h-[45vh] rounded-3xl overflow-hidden shadow-sm bg-slate-900 group flex-shrink-0">
            <img
              src={match.image_url || stadiumImage || DEFAULT_IMAGE}
              alt={`${match.team_a} vs ${match.team_b}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
              <span className="inline-flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wide mb-4 border border-blue-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live Ticketing Open
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none drop-shadow-2xl">
                {match.team_a}{" "}
                <span className="text-blue-500 font-medium mx-1 md:mx-2 text-2xl md:text-4xl">
                  vs
                </span>{" "}
                {match.team_b}
              </h1>
            </div>
          </div>

          {/* ── RIGHT: Side Image (1/3 width) ── */}
          <div className="w-full md:w-1/3 h-[15vh] md:h-[45vh] rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white flex-shrink-0">
            <img
              src={cricecoSidebarImage}
              alt="Criceco Promo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ── 3. DESCRIPTION & VENUE DETAILS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              Match Overview
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed font-light">
              {match.description ||
                "The stage is set for an epic clash between these two titans. Secure your seats now to witness the action live. Browse the stadium layout below to find your perfect spot before tickets sell out!"}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg flex flex-col space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              Event Details
            </h3>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 flex-shrink-0">
                <CalendarIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide mb-1">
                  Date & Time
                </p>
                <p className="text-slate-900 font-bold text-lg leading-tight">
                  {new Date(match.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-slate-600 font-medium text-base mt-1">
                  {new Date(match.date).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {stadiumData && (
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 hover:bg-green-100 transition-colors duration-200">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 flex-shrink-0">
                  <LocationIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-semibold uppercase tracking-wide mb-1">
                    Venue
                  </p>
                  <p className="text-slate-900 font-bold text-lg leading-tight">
                    {stadiumData.name}
                  </p>
                  <p className="text-slate-600 font-medium text-base mt-1">
                    {stadiumData.city}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. STADIUM LAYOUT SECTION ── */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Interactive Seat Map
          </h3>
          <span className="text-sm hidden sm:block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-medium">
            Select a stand to view blocks
          </span>
        </div>

        {stadiumData ? (
          <div className="relative z-0 bg-white p-4 md:p-10 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100">
            <StadiumViewer
              stadiumData={stadiumData}
              matchLabel={matchLabel}
              matchId={match.id}
              matchDate={match.date}
              stadiumImage={stadiumImage}
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium">
              Stadium layout not found for ID{" "}
              <span className="text-blue-600 font-bold px-1">
                {match.stadium_id}
              </span>
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Check your stadiums registry to ensure this map is available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}