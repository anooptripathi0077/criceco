// ─── Wankhede Stadium · Mumbai ───────────────────────────────────────────────
const stad1 = {
  id: 'wankhede',
  name: 'Wankhede Stadium',
  city: 'Mumbai',
  country: 'India',
  capacity: 33108,
  image: 'https://ddbuunwwdcbgchbaphnp.supabase.co/storage/v1/object/sign/stands/wankhede.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83ZmEyNWZmMS05ZDY0LTRiYTAtODBkOS1lYjUzOTlmZTAzZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGFuZHMvd2Fua2hlZGUuanBlZyIsImlhdCI6MTc3NjYzOTYzOSwiZXhwIjoxODA4MTc1NjM5fQ.CXKbb9pMbDDSxlOJDWgq8Q4GH2KF3nYfvJ7Ht-DAkSc',

  // Each stand: drawn as an arc slice on the canvas
  // start/end = degrees (0 = top, clockwise)
  // inner/outer = fraction of canvas radius
  stands: [
    { id: 'vip_p',  name: 'VVIP', type: 'VVIP Premium',                 color: '#FF8700', start: 260, end: 280,  inner: 0.22, outer: 0.42, base: 35000, mult: 2.0, cap: 800  },
    { id: 'i1',     name: 'N Lower A',      type: 'Premium Tier',   color: '#06daffed', start: 220, end: 260,  inner: 0.22, outer: 0.42, base: 9000,  mult: 1.5, cap: 2200 },
    { id: 'i2',     name: 'N Lower B',      type: 'Premium Tier',   color: '#06daffed', start: 280, end: 320,  inner: 0.22, outer: 0.42, base: 9000,  mult: 1.5, cap: 2200 },
    { id: 'i3',     name: 'East Lower',         type: 'Club Tier',      color: '#ff4000ed', start: 320, end: 400,  inner: 0.22, outer: 0.42, base: 5000,  mult: 1.3, cap: 3400 },
    { id: 'i4',     name: 'South Pavilion',     type: 'VVIP Premium',   color: '#06daffed', start: 40,  end: 140,  inner: 0.22, outer: 0.42, base: 15000, mult: 1.8, cap: 4200 },
    { id: 'i5',     name: 'West Lower',         type: 'Club Tier',      color: '#ff4000ed', start: 140, end: 220,  inner: 0.22, outer: 0.42, base: 5000,  mult: 1.3, cap: 3200 },
    { id: 'm1',     name: 'North Executive',    type: 'Executive Tier', color: '#AE2248', start: 220, end: 320,  inner: 0.42, outer: 0.65, base: 7500,  mult: 1.4, cap: 4800 },
    { id: 'vip_g',  name: 'South Grandstand',   type: 'VIP Elite',      color: '#AE2248', start: 60,  end: 120,  inner: 0.42, outer: 0.65, base: 22000, mult: 1.9, cap: 2000 },
    { id: 'm2',     name: 'East Grandstand',    type: 'General',        color: '#ae00ff', start: 320, end: 420,  inner: 0.42, outer: 0.65, base: 3500,  mult: 1.1, cap: 5200 },
    { id: 'm4',     name: 'West Grandstand',    type: 'General',        color: '#ae00ff', start: 120, end: 220,  inner: 0.42, outer: 0.65, base: 3500,  mult: 1.1, cap: 5000 },
    { id: 'o1',     name: 'NW Upper',           type: 'Upper Deck',     color: '#2c19be', start: 180, end: 270,  inner: 0.65, outer: 0.95, base: 2500,  mult: 1.0, cap: 6000 },
    { id: 'o2',     name: 'NE Upper',           type: 'Upper Deck',     color: '#167004', start: 270, end: 360,  inner: 0.65, outer: 0.95, base: 2500,  mult: 1.0, cap: 6000 },
    { id: 'o3',     name: 'SE Upper',           type: 'Upper Deck',     color: '#3b43b6', start: 0,   end: 90,   inner: 0.65, outer: 0.95, base: 1800,  mult: 0.9, cap: 7000 },
    { id: 'o4',     name: 'SW Upper',           type: 'Upper Deck',     color: '#167004', start: 90,  end: 180,  inner: 0.65, outer: 0.95, base: 1800,  mult: 0.9, cap: 7000 },
  ],

  legend: [
    { label: 'VVIP / President', color: '#a93226' },
    { label: 'Premium / VIP',    color: '#e8a09b' },
    { label: 'Club Tier',        color: '#f5c5c2' },
    { label: 'Executive',        color: '#e63329' },
    { label: 'General',          color: '#fadadd' },
    { label: 'Upper Deck',       color: '#d5d5d5' },
  ],
};

export default stad1;