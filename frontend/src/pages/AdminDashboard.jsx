import React, { useState } from "react";
import { backendAPI } from "../services/api";
import { getStadium, getAllStadiumEntries } from "../stadiums";

// --- Icons ---
const LocationIcon = () => (
  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function AdminDashboard() {
  const availableStadiums = getAllStadiumEntries();

  const [matchData, setMatchData] = useState({
    team_a: "",
    team_b: "",
    stadium_id: "",
    date: "",
    description: "",
    image_url: "",
  });

  const [successMsg, setSuccessMsg] = useState(false);

  // Fallback image in case nothing is provided
  const DEFAULT_STADIUM_IMAGE = "https://images.unsplash.com/photo-1574629810360-1effacdded2a?q=80&w=2805&auto=format&fit=crop";

  const handleAddMatch = async (e) => {
    e.preventDefault();
    try {
      const stadiumLayout = getStadium(matchData.stadium_id);
      let pricing_tiers = [];

      if (stadiumLayout?.stands) {
        pricing_tiers = stadiumLayout.stands.map((stand) => ({
          stand_id: stand.id,
          base_price: stand.base,
        }));
      }

      await backendAPI.post("/matches", {
        team_a: matchData.team_a,
        team_b: matchData.team_b,
        stadium_id: matchData.stadium_id,
        date: matchData.date,
        description: matchData.description,
        image_url: matchData.image_url,
        pricing_tiers,
      });

      setMatchData({ 
        team_a: "", 
        team_b: "", 
        stadium_id: "", 
        date: "", 
        description: "", 
        image_url: "" 
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Error adding match");
    }
  };

  const selectedStadium = matchData.stadium_id ? getStadium(matchData.stadium_id) : null;

  // --- Live Preview Variables ---
  const hasPreview = matchData.image_url || selectedStadium || matchData.team_a || matchData.team_b;
  const stadiumBgImage = selectedStadium?.image || selectedStadium?.images || DEFAULT_STADIUM_IMAGE;

  return (
    <div className="min-h-[85vh] bg-[#e2e9f0] font-['Inter',sans-serif] text-slate-900 pb-24 pt-10">
      {/* ── Header ── */}
      <header className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Admin Control Panel
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
          Admin <span className="text-blue-600">Dashboard</span>
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto font-medium">
          Create matches, configure stadium pricing, and manage event setup.
        </p>
      </header>

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* ── LEFT: Create Match Form ── */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest font-['JetBrains_Mono']">
                  Create Match
                </h2>
              </div>

              <div className="p-8 md:p-10">
                <form onSubmit={handleAddMatch} className="flex flex-col gap-6">
                  {/* Teams Row */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="label-style">Team A</label>
                      <input
                        type="text"
                        placeholder="e.g. India"
                        value={matchData.team_a}
                        onChange={(e) => setMatchData({ ...matchData, team_a: e.target.value })}
                        required
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label className="label-style">Team B</label>
                      <input
                        type="text"
                        placeholder="e.g. Australia"
                        value={matchData.team_b}
                        onChange={(e) => setMatchData({ ...matchData, team_b: e.target.value })}
                        required
                        className="input-style"
                      />
                    </div>
                  </div>

                  {/* Stadium & Date Row */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="label-style">Stadium</label>
                      <select
                        value={matchData.stadium_id}
                        onChange={(e) => setMatchData({ ...matchData, stadium_id: e.target.value })}
                        required
                        className="input-style appearance-none cursor-pointer"
                      >
                        <option value="">Select Venue...</option>
                        {availableStadiums.map((s) => (
                          <option key={s.key} value={s.key}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-style">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={matchData.date}
                        onChange={(e) => setMatchData({ ...matchData, date: e.target.value })}
                        required
                        className="input-style"
                      />
                    </div>
                  </div>

                  {/* Image URL Field */}
                  <div>
                    <label className="label-style">Match Banner Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo..."
                      value={matchData.image_url}
                      onChange={(e) => setMatchData({ ...matchData, image_url: e.target.value })}
                      className="input-style"
                    />
                  </div>

                  {/* Description Field (Made taller with rows="5") */}
                  <div>
                    <label className="label-style">Match Description</label>
                    <textarea
                      rows="5"
                      placeholder="Enter match details, highlights, or rules..."
                      value={matchData.description}
                      onChange={(e) => setMatchData({ ...matchData, description: e.target.value })}
                      className="input-style resize-none"
                    />
                  </div>

                  {successMsg && (
                    <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-2xl animate-[fadeUp_0.3s_ease-out]">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-base font-semibold text-green-800">Match created successfully.</p>
                    </div>
                  )}

                  {/* Button made taller with py-5 and text-lg */}
                  <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mt-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Match
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Live Match Preview ── */}
          <div className="xl:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden h-full min-h-[680px] flex flex-col">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest font-['JetBrains_Mono']">
                   Match Preview
                </h2>
                {hasPreview && (
                  <span className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   UPDATE
                  </span>
                )}
              </div>

              <div className="flex-grow p-6 md:p-10 flex flex-col justify-center h-full bg-slate-50">
                {!hasPreview ? (
                  <div className="text-center py-32">
                    <div className="w-24 h-24 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ImageIcon />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">No Data Entered</h3>
                    <p className="text-slate-500 text-base mt-3 max-w-sm mx-auto">Type a team name, enter an image URL, or select a stadium to see a live visual preview.</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
                    
                    {/* TOP HALF: Match Banner Preview (Taller) */}
                    <div className="relative flex-1 rounded-[2rem] overflow-hidden shadow-lg border border-slate-200/50 bg-white min-h-[280px] flex flex-col group">
                      {matchData.image_url ? (
                        <img 
                          src={matchData.image_url} 
                          alt="Match Banner" 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                          <ImageIcon />
                          <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-1">No Banner Image</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none" />
                      
                      <div className="absolute top-6 left-6 inline-block px-4 py-1.5 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-black tracking-widest uppercase shadow-md border border-blue-500/50">
                        Event Banner
                      </div>
                      
                      {/* <div className="absolute bottom-0 left-0 p-8 w-full">
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                          {(matchData.team_a || matchData.team_b) ? (
                            <>
                              {matchData.team_a || "TBD"} <span className="text-blue-400 italic mx-2 font-medium text-3xl">vs</span> {matchData.team_b || "TBD"}
                            </>
                          ) : (
                            "Match Teams"
                          )}
                        </h3>
                      </div> */}
                    </div>

                    {/* BOTTOM HALF: Stadium Venue Preview (Taller) */}
                    <div className="relative flex-1 rounded-[2rem] overflow-hidden shadow-lg border border-slate-200/50 bg-white min-h-[280px] flex flex-col group">
                      {!selectedStadium ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                          <LocationIcon />
                          <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-1">No Venue Selected</p>
                        </div>
                      ) : (
                        <>
                          <img 
                            src={stadiumBgImage} 
                            alt="Stadium Background" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent pointer-events-none" />
                          
                          <div className="absolute top-6 left-6 inline-block px-4 py-1.5 rounded-lg bg-slate-800/90 backdrop-blur-md text-white text-[11px] font-black tracking-widest uppercase shadow-md border border-slate-600/50">
                            Match Venue
                          </div>

                          <div className="absolute bottom-0 left-0 p-8 w-full">
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-2">
                              {selectedStadium.name}
                            </h3>
                            <p className="text-blue-300 font-semibold flex items-center gap-2 text-lg drop-shadow-md">
                              <LocationIcon /> {selectedStadium.city}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .input-style {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.875rem;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          font-weight: 500;
          color: #0f172a;
          transition: all 0.2s ease-in-out;
        }
        .input-style::placeholder {
          color: #94a3b8;
        }
        .input-style:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
          background: #ffffff;
        }
        .label-style {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}