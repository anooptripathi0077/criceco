import { useState, useEffect, useRef } from 'react';
import { backendAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Premium SVG Component for Visual Block Selection
const StandOverviewSVG = ({ blocks, onBlockClick }) => {
  const [hoveredBlock, setHoveredBlock] = useState(null);

  return (
    <div style={{ position: 'relative', width: '100%', height: '350px', display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 800 300" style={{ width: '100%', height: '100%' }}>
        {blocks.map((block, i) => {
          const startAngle = (i * 20) - 80;
          const endAngle = startAngle + 18;
          const x1 = 400 + 200 * Math.cos(startAngle * Math.PI / 180);
          const y1 = 280 + 200 * Math.sin(startAngle * Math.PI / 180);
          const x2 = 400 + 200 * Math.cos(endAngle * Math.PI / 180);
          const y2 = 280 + 200 * Math.sin(endAngle * Math.PI / 180);
          const x3 = 400 + 100 * Math.cos(endAngle * Math.PI / 180);
          const y3 = 280 + 100 * Math.sin(endAngle * Math.PI / 180);
          const x4 = 400 + 100 * Math.cos(startAngle * Math.PI / 180);
          const y4 = 280 + 100 * Math.sin(startAngle * Math.PI / 180);

          const d = `M ${x1} ${y1} A 200 200 0 0 1 ${x2} ${y2} L ${x3} ${y3} A 100 100 0 0 0 ${x4} ${y4} Z`;
          
          let fill = '#f1f3f5';
          if (hoveredBlock?.id === block.id) {
            fill = block.category === 'VIP' ? '#f39c12' : '#e63329';
          }

          return (
            <path
              key={block.id}
              d={d}
              fill={fill}
              stroke="#ffffff"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseEnter={() => setHoveredBlock(block)}
              onMouseLeave={() => setHoveredBlock(null)}
              onClick={() => onBlockClick(block)}
            />
          );
        })}
        <ellipse cx="400" cy="280" rx="60" ry="30" fill="#2ecc71" opacity="0.3" stroke="#27ae60" strokeWidth="2" />
        <text x="400" y="295" textAnchor="middle" style={{ fontFamily: 'Bebas Neue', fontSize: '10px', fill: '#27ae60', letterSpacing: '2px' }}>PITCH</text>
      </svg>
      
      {hoveredBlock && (
        <div style={{
          position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(26,0,0,0.9)', padding: '15px 25px', borderRadius: '12px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.3)', color: 'white',
          border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none', textAlign: 'center'
        }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '1px' }}>{hoveredBlock.name}</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '5px' }}>
            <span style={{ fontSize: '10px', background: '#e63329', padding: '2px 6px', borderRadius: '4px' }}>{hoveredBlock.category}</span>
            <span style={{ fontSize: '10px', background: '#3498db', padding: '2px 6px', borderRadius: '4px' }}>{hoveredBlock.tier}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SeatGridModal({ matchId, standData, onClose }) {
  const [view, setView] = useState('blocks'); 
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1); 
  const gridContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (view === 'blocks') {
      const fetchBlocks = async () => {
        try {
          setLoading(true);
          const res = await backendAPI.get(`/matches/${matchId}/stands/${standData.id}/blocks`);
          setBlocks(res.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load blocks');
        } finally {
          setLoading(false);
        }
      };
      fetchBlocks();
    }
  }, [matchId, standData.id, view]);

  const handleBlockClick = async (block) => {
    try {
      setLoading(true);
      setSelectedBlock(block);
      setZoomLevel(1);
      const res = await backendAPI.get(`/matches/${matchId}/blocks/${block.id}/seats`);
      setSeats(res.data);
      setView('seats');
    } catch (err) {
      setError('Failed to load seats for this block');
    } finally {
      setLoading(false);
    }
  };

  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row_id]) acc[seat.row_id] = [];
    acc[seat.row_id].push(seat);
    return acc;
  }, {});

  const handleSeatClick = (seat) => {
    if (zoomLevel < 3) {
      setZoomLevel(4);
    } else if (seat.seat_status === 'Available') {
      navigate(`/checkout/${matchId}/${seat.seat_id}`);
    }
  };

  const isVIP = selectedBlock?.category === 'VIP';
  const isUpper = selectedBlock?.tier === 'Upper';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, backdropFilter: 'blur(20px)'
    }}>
      <div style={{
        background: '#ffffff',
        width: '98%', maxWidth: isUpper ? '1500px' : '1400px',
        maxHeight: '94vh', overflow: 'hidden',
        borderRadius: '40px',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        boxShadow: isVIP ? '0 50px 150px rgba(243, 156, 18, 0.2)' : '0 50px 150px rgba(0, 0, 0, 0.7)',
        border: isVIP ? '2px solid #f39c12' : '1px solid rgba(0,0,0,0.05)'
      }}>
        
        <div style={{ padding: '30px 50px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            {view === 'seats' && (
              <button 
                onClick={() => setView('blocks')}
                style={{
                  background: isVIP ? '#f39c12' : '#1a0000', border: 'none', borderRadius: '12px',
                  padding: '12px 20px', cursor: 'pointer', fontFamily: 'JetBrains Mono',
                  fontSize: '12px', color: 'white', fontWeight: 'bold'
                }}
              >
                ← STADIUM VIEW
              </button>
            )}
            <div>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', margin: 0, color: '#1a0000', letterSpacing: '2px', lineHeight: 0.9 }}>
                {standData.name} {view === 'seats' ? `- ${selectedBlock?.name}` : ''}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', background: isVIP ? '#f39c12' : '#e63329', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>{selectedBlock?.category || 'LIVE'}</span>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                   Tier: {selectedBlock?.tier || 'General'} | {seats.length} Seats
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {view === 'seats' && (
              <div style={{ background: '#f1f3f5', borderRadius: '15px', padding: '5px', display: 'flex', gap: '5px' }}>
                <button onClick={() => setZoomLevel(1)} style={{ border: 'none', background: zoomLevel === 1 ? 'white' : 'transparent', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontFamily: 'JetBrains Mono', cursor: 'pointer', boxShadow: zoomLevel === 1 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>1X</button>
                <button onClick={() => setZoomLevel(4)} style={{ border: 'none', background: zoomLevel === 4 ? 'white' : 'transparent', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontFamily: 'JetBrains Mono', cursor: 'pointer', boxShadow: zoomLevel === 4 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>4X</button>
              </div>
            )}
            <button onClick={onClose} style={{ background: '#f8f9fa', border: 'none', borderRadius: '20px', width: '60px', height: '60px', fontSize: '24px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        <div ref={gridContainerRef} style={{ flex: 1, overflow: 'auto', padding: isUpper ? '30px' : '50px', background: '#fafafa', position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', border: '5px solid #eee', borderTop: `5px solid ${isVIP ? '#f39c12' : '#e63329'}`, borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#1a0000', letterSpacing: '2px' }}>CALIBRATING STADIUM LAYOUT...</p>
            </div>
          )}

          {error && <p style={{ color: '#e63329', textAlign: 'center', padding: '50px', fontFamily: 'JetBrains Mono' }}>{error}</p>}
          
          {!loading && !error && view === 'blocks' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', animation: 'fadeIn 0.5s ease-out' }}>
              <StandOverviewSVG blocks={blocks} onBlockClick={handleBlockClick} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', width: '100%', maxWidth: '800px' }}>
                {blocks.map(block => (
                  <div 
                    key={block.id} 
                    onClick={() => handleBlockClick(block)} 
                    style={{ 
                      padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #eee', 
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = block.category === 'VIP' ? '#f39c12' : '#e63329'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', color: '#1a0000' }}>{block.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', marginTop: '5px' }}>{block.category} | {block.available_seats} SEATS</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && view === 'seats' && (
            <div style={{ 
              display: 'flex', flexDirection: 'column', gap: zoomLevel === 1 ? '4px' : '20px', 
              alignItems: 'center', minWidth: 'min-content', margin: '0 auto',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'zoomIn 0.4s cubic-bezier(0, 0, 0.2, 1)'
            }}>
              {Object.keys(rows).sort().map(rowId => (
                <div key={rowId} style={{ display: 'flex', alignItems: 'center', gap: zoomLevel === 1 ? '4px' : '20px' }}>
                  {zoomLevel > 1 && (
                    <div style={{ width: '50px', fontFamily: 'JetBrains Mono', fontWeight: 'bold', color: '#adb5bd', fontSize: '16px' }}>{rowId}</div>
                  )}
                  <div style={{ display: 'flex', gap: zoomLevel === 1 ? '2px' : '10px', flexWrap: 'nowrap' }}>
                    {rows[rowId].map(seat => {
                      let bgColor = isVIP ? '#f39c12' : '#e63329';
                      let opacity = 1;
                      if (seat.seat_status !== 'Available') {
                        bgColor = '#dee2e6';
                        opacity = 0.4;
                      }

                      const seatSize = zoomLevel === 1 ? (isUpper ? '6px' : '10px') : '36px';

                      return (
                        <div 
                          key={seat.seat_id}
                          onClick={() => handleSeatClick(seat)}
                          title={zoomLevel > 1 ? `${rowId}${seat.seat_number}` : ''}
                          style={{
                            width: seatSize, height: seatSize,
                            background: bgColor, borderRadius: zoomLevel === 1 ? '2px' : '10px 10px 4px 4px',
                            cursor: 'pointer', opacity: opacity,
                            transition: 'all 0.2s',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: 'white', fontFamily: 'JetBrains Mono', fontSize: '10px',
                            boxShadow: zoomLevel > 1 && seat.seat_status === 'Available' ? (isVIP ? '0 4px 12px rgba(243, 156, 18, 0.3)' : '0 4px 8px rgba(0,0,0,0.1)') : 'none'
                          }}
                          onMouseEnter={e => { if(zoomLevel > 1 && seat.seat_status === 'Available') { e.target.style.transform = 'translateY(-5px) scale(1.15)'; } }}
                          onMouseLeave={e => { if(zoomLevel > 1 && seat.seat_status === 'Available') { e.target.style.transform = 'translateY(0) scale(1)'; } }}
                        >
                          {zoomLevel > 1 ? seat.seat_number : ''}
                        </div>
                      )
                    })}
                  </div>
                  {zoomLevel > 1 && (
                    <div style={{ width: '50px', fontFamily: 'JetBrains Mono', fontWeight: 'bold', color: '#adb5bd', textAlign: 'right', fontSize: '16px' }}>{rowId}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {view === 'seats' && (
          <div style={{ padding: '20px 50px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'center', gap: '50px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#1a0000', fontWeight: '500' }}>
              <div style={{ width: '20px', height: '20px', background: isVIP ? '#f39c12' : '#e63329', borderRadius: '6px' }}></div> AVAILABLE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#1a0000', fontWeight: '500' }}>
              <div style={{ width: '20px', height: '20px', background: '#dee2e6', borderRadius: '6px' }}></div> RESERVED
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 5px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #bbb; }
      `}} />
    </div>
  );
}
