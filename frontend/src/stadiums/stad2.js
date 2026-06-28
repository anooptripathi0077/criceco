// ─── Eden Gardens · Kolkata ──────────────────────────────────────────────────
// Eden Gardens has a distinct horseshoe shape — the west side (Club House end)
// is open/has a smaller stand. We model that by leaving a gap from ~230–310 deg
// in the inner tiers, and the upper tier wraps almost fully around.

const stad2 = {
  id: 'eden_gardens',
  name: 'Eden Gardens',
  city: 'Kolkata',
  country: 'India',
  capacity: 66349,
  image: 'https://ddbuunwwdcbgchbaphnp.supabase.co/storage/v1/object/sign/stands/eg_mainimg.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83ZmEyNWZmMS05ZDY0LTRiYTAtODBkOS1lYjUzOTlmZTAzZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGFuZHMvZWdfbWFpbmltZy5qcGciLCJpYXQiOjE3NzY2MzA2NDUsImV4cCI6MTgwODE2NjY0NX0.g9wEf6XMpRLqIURfc0YNix5C-aRxB7lMfco6WKGYYm4',

  stands: [
    // ── Inner tier ──
    { id: 'eg_club',   name: 'Club House',       type: 'VVIP Premium',   color: '#FFB300', start: 250, end: 290,  inner: 0.20, outer: 0.40, base: 40000, mult: 2.2, cap: 600  },
    { id: 'eg_b',      name: 'B Block',          type: 'Premium Tier',   color: '#6A1B9A', start: 290, end: 360,  inner: 0.20, outer: 0.40, base: 8000,  mult: 1.6, cap: 3000 },
    { id: 'eg_a',      name: 'A Block',          type: 'Premium Tier',   color: '#0277BD', start: 0,   end: 70,   inner: 0.20, outer: 0.40, base: 8000,  mult: 1.6, cap: 3000 },
    { id: 'eg_h',      name: 'H Block',          type: 'Club Tier',      color: '#FFB300', start: 70,  end: 130,  inner: 0.20, outer: 0.40, base: 5000,  mult: 1.3, cap: 4000 },
    { id: 'eg_g',      name: 'G Block',          type: 'Club Tier',      color: '#6A1B9A', start: 130, end: 190,  inner: 0.20, outer: 0.40, base: 5000,  mult: 1.3, cap: 3800 },
    { id: 'eg_f',      name: 'F Block',          type: 'Club Tier',      color: '#0277BD', start: 190, end: 250,  inner: 0.20, outer: 0.40, base: 5000,  mult: 1.3, cap: 3600 },

    // ── Middle tier ──
    { id: 'eg_vip',    name: 'VIP Pavilion',     type: 'VIP Elite',      color: '#FF8F00', start: 255, end: 285,  inner: 0.40, outer: 0.62, base: 25000, mult: 2.0, cap: 1200 },
    { id: 'eg_exec_n', name: 'North Executive',  type: 'Executive Tier', color: '#7b155c', start: 285, end: 360,  inner: 0.40, outer: 0.62, base: 7000,  mult: 1.5, cap: 5500 },
    { id: 'eg_exec_s', name: 'South Executive',  type: 'Executive Tier', color: '#2f7509', start: 0,   end: 75,   inner: 0.40, outer: 0.62, base: 7000,  mult: 1.5, cap: 5500 },
    { id: 'eg_gen_e',  name: 'East General',     type: 'General',        color: '#7b155c', start: 75,  end: 185,  inner: 0.40, outer: 0.62, base: 3000,  mult: 1.1, cap: 9000 },
    { id: 'eg_gen_w',  name: 'West General',     type: 'General',        color: '#2f7509', start: 185, end: 255,  inner: 0.40, outer: 0.62, base: 3000,  mult: 1.1, cap: 8500 },

    // ── Upper tier (nearly full ring) ──
    { id: 'eg_u1',     name: 'Upper North',      type: 'Upper Deck',     color: '#00838F', start: 230, end: 360,  inner: 0.62, outer: 0.95, base: 1500,  mult: 0.9, cap: 10000 },
    { id: 'eg_u2',     name: 'Upper South',      type: 'Upper Deck',     color: '#4ca7d7', start: 0,   end: 120,  inner: 0.62, outer: 0.95, base: 1500,  mult: 0.9, cap: 10000 },
    { id: 'eg_u3',     name: 'Upper East',       type: 'Upper Deck',     color: '#021896', start: 120, end: 230,  inner: 0.62, outer: 0.95, base: 1200,  mult: 0.8, cap: 8000  },
  ],

  legend: [
    { label: 'VVIP / VIP Box', color: '#FFB300' },
    { label: 'Premium (A/B)',  color: '#6A1B9A' },
    { label: 'Executive',      color: '#4527A0' },
    { label: 'Club (F/G/H)',   color: '#0277BD' },
    { label: 'General',        color: '#00838F' },
    { label: 'Upper Deck',     color: '#4DD0E1' },
  ],
};

export default stad2;