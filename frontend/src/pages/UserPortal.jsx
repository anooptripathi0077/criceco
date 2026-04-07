import { useState, useEffect } from "react";
import { getStadium } from "../stadiums";
import StadiumViewer from "../components/StadiumViewer";
import { backendAPI } from "../services/api";


if (!document.getElementById("cn-fonts")) {
  const l = document.createElement("link");
  l.id = "cn-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap";
  document.head.appendChild(l);
}


export default function UserPortal() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Fetch real matches from the API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await backendAPI.get('/matches');
        setMatches(response.data);
      } catch (error) {
        console.error("Failed to fetch matches", error);
      }
    };
    fetchMatches();
  }, []);

  // Compute stadium data and label when a match is selected
  const stadiumData = selectedMatch ? getStadium(selectedMatch.stadium_id) : null;
  const matchLabel = selectedMatch
    ? `${selectedMatch.team_a} vs ${selectedMatch.team_b} · ${new Date(selectedMatch.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
    : null;

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", padding: "28px 20px", fontFamily: "Syne, sans-serif" }}>
      
      <style>{`
        body { margin: 0; }
        .cn-match { transition: box-shadow 0.2s, border-color 0.2s, background 0.2s; cursor: pointer; }
        .cn-match:hover { border-color: #e63329 !important; box-shadow: 0 4px 16px rgba(230,51,41,0.14) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#e63329", padding: "6px 20px", borderRadius: 50, marginBottom: 14 }}>
          <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 16, letterSpacing: 4, color: "#fff" }}>CRIC</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
          <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 16, letterSpacing: 4, color: "rgba(255,255,255,0.85)" }}>NEXUS</span>
        </div>
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(38px,6vw,66px)", lineHeight: 0.92, margin: 0, color: "#1a0000", letterSpacing: 1 }}>
          STADIUM <span style={{ color: "#e63329" }}>SEATING</span> MAP
        </h1>
        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#b07070", letterSpacing: 2, marginTop: 10, textTransform: "uppercase" }}>
          Select a match to explore the seating layout
        </p>
      </div>

      {/* ── Match selector ── */}
      <div style={{ maxWidth: 1350, margin: "0 auto 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 20, background: "#e63329", borderRadius: 2 }} />
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, color: "#1a0000", letterSpacing: 3 }}>
            UPCOMING MATCHES
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
          {matches.length === 0 && (
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#b07070", gridColumn: "1/-1" }}>
              Loading matches…
            </p>
          )}
          {matches.map((match) => {
            const sel = selectedMatch?.id === match.id;
            const stadium = getStadium(match.stadium_id);
            return (
              <div
                key={match.id}
                className="cn-match"
                onClick={() => setSelectedMatch(match)}
                style={{
                  border: sel ? "2px solid #e63329" : "1px solid #f0dada",
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: sel ? "linear-gradient(135deg,#fff5f5,#fde8e8)" : "#ffffff",
                  boxShadow: sel ? "0 4px 20px rgba(230,51,41,0.18)" : "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                {sel && (
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "#e63329", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>
                    ● SELECTED
                  </div>
                )}
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, color: "#1a0000", marginBottom: 5 }}>
                  {match.team_a} <span style={{ color: "#e63329" }}>vs</span> {match.team_b}
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "#b07070", marginBottom: 4 }}>
                  📅 {new Date(match.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
                {stadium && (
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "#c0392b", letterSpacing: 1 }}>
                    🏟 {stadium.name}, {stadium.city}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stadium viewer ── */}
      {selectedMatch && stadiumData && (
        <div style={{ maxWidth: 1350, margin: "0 auto" }}>
          <StadiumViewer stadiumData={stadiumData} matchLabel={matchLabel} matchId={selectedMatch.id} />
        </div>
      )}

      {selectedMatch && !stadiumData && (
        <div style={{ maxWidth: 1350, margin: "0 auto", padding: 40, textAlign: "center", fontFamily: "JetBrains Mono, monospace", color: "#b07070", fontSize: 12 }}>
          Stadium layout not found for id "{selectedMatch.stadium_id}". Check your <code>stadiums/index.js</code> registry.
        </div>
      )}
    </div>
  );
}