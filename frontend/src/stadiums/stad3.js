// ─── Narendra Modi Stadium · Ahmedabad ───────────────────────────────────────
// Layout: The largest cricket stadium in the world. 
// Features a continuous lower bowl, a corporate middle ring, and a massive 
// enclosed 360° upper deck that completely surrounds the ground.

const stad3 = {
  id: 'ahmedabad',
  name: 'Narendra Modi Stadium',
  city: 'Ahmedabad',
  country: 'India',
  capacity: 132000,
  image: 'https://ddbuunwwdcbgchbaphnp.supabase.co/storage/v1/object/sign/stands/ahmedabadmain.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83ZmEyNWZmMS05ZDY0LTRiYTAtODBkOS1lYjUzOTlmZTAzZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGFuZHMvYWhtZWRhYmFkbWFpbi5qcGciLCJpYXQiOjE3NzY2OTA3NTksImV4cCI6MTgwODIyNjc1OX0.HtjIzKZ2NQ4p7yKZGvM90MJfhUTjJuxNJRLwJVwlroI',

  stands: [
    // ── LOWER BOWL (Full 360° Ring) ──
    { id: 'l_n',  name: 'North Lower',      type: 'Premium Tier', color: '#4C8CE4', start: 340, end: 380, inner: 0.22, outer: 0.48, base: 4000,  mult: 1.5, cap: 6500 },
    { id: 'l_ne', name: 'NE Lower',         type: 'General',      color: '#406093', start: 20,  end: 70,  inner: 0.22, outer: 0.48, base: 2500,  mult: 1.2, cap: 8000 },
    { id: 'l_e',  name: 'East Lower',       type: 'Club Tier',    color: '#4C8CE4', start: 70,  end: 110, inner: 0.22, outer: 0.48, base: 3500,  mult: 1.3, cap: 7000 },
    { id: 'l_se', name: 'SE Lower',         type: 'General',      color: '#406093', start: 110, end: 160, inner: 0.22, outer: 0.48, base: 2500,  mult: 1.2, cap: 8000 },
    { id: 'l_s',  name: 'South Lower',      type: 'Premium Tier', color: '#4C8CE4', start: 160, end: 200, inner: 0.22, outer: 0.48, base: 4000,  mult: 1.5, cap: 6500 },
    { id: 'l_sw', name: 'SW Lower',         type: 'General',      color: '#406093', start: 200, end: 250, inner: 0.22, outer: 0.48, base: 2500,  mult: 1.2, cap: 8000 },
    { id: 'l_w',  name: 'West Lower',       type: 'Club Tier',    color: '#4C8CE4', start: 250, end: 290, inner: 0.22, outer: 0.48, base: 3500,  mult: 1.3, cap: 7000 },
    { id: 'l_nw', name: 'NW Lower',         type: 'General',      color: '#406093', start: 290, end: 340, inner: 0.22, outer: 0.48, base: 2500,  mult: 1.2, cap: 8000 },

    // ── CORPORATE RING (Thin 360° Ring in the middle) ──
    { id: 'c_n',  name: 'North VIP Box',    type: 'VIP Elite',    color: '#FFB33F', start: 330, end: 390, inner: 0.48, outer: 0.60, base: 20000, mult: 1.8, cap: 1500 },
    { id: 'c_e',  name: 'East Corporate',   type: 'Executive',    color: '#FF4400', start: 30,  end: 150, inner: 0.48, outer: 0.60, base: 12000, mult: 1.6, cap: 3500 },
    { id: 'c_s',  name: 'Presidential Box', type: 'VVIP Premium', color: '#FFB33F', start: 150, end: 210, inner: 0.48, outer: 0.60, base: 35000, mult: 2.5, cap: 1000 },
    { id: 'c_w',  name: 'West Corporate',   type: 'Executive',    color: '#FF4400', start: 210, end: 330, inner: 0.48, outer: 0.60, base: 12000, mult: 1.6, cap: 3500 },

    // ── UPPER DECK (Fully Enclosed 360° Ring) ──
    // Added North and South upper decks to close the gaps
    { id: 'u_n',  name: 'North Upper',      type: 'Upper Deck',   color: '#346739', start: 330, end: 390, inner: 0.60, outer: 0.96, base: 1200,  mult: 1.0, cap: 12000 },
    { id: 'u_e1', name: 'East Upper N',     type: 'Upper Deck',   color: '#99AD7A', start: 30,  end: 90,  inner: 0.60, outer: 0.96, base: 1500,  mult: 1.0, cap: 12000 },
    { id: 'u_e2', name: 'East Upper S',     type: 'Upper Deck',   color: '#346739', start: 90,  end: 150, inner: 0.60, outer: 0.96, base: 1500,  mult: 1.0, cap: 12000 },
    { id: 'u_s',  name: 'South Upper',      type: 'Upper Deck',   color: '#99AD7A', start: 150, end: 210, inner: 0.60, outer: 0.96, base: 1200,  mult: 1.0, cap: 12000 },
    { id: 'u_w1', name: 'West Upper S',     type: 'Upper Deck',   color: '#346739', start: 210, end: 270, inner: 0.60, outer: 0.96, base: 1500,  mult: 1.0, cap: 12000 },
    { id: 'u_w2', name: 'West Upper N',     type: 'Upper Deck',   color: '#99AD7A', start: 270, end: 330, inner: 0.60, outer: 0.96, base: 1500,  mult: 1.0, cap: 12000 },
  ],

  legend: [
    { label: 'Lower Premium',  color: '#00b4d8' },
    { label: 'Lower General',  color: '#0077b6' },
    { label: 'VVIP / VIP Box', color: '#ffb703' },
    { label: 'Corporate Box',  color: '#fb8500' },
    { label: 'Upper Deck Sides', color: '#c9184a' },
    { label: 'Upper Deck Ends',  color: '#800f2f' }, // Added new legend entry
  ],
};

export default stad3;