import { useState } from 'react';
import StadiumMap from './StadiumMap';
import SeatGridModal from './SeatGridModal';

export default function StadiumViewer({ stadiumData, matchLabel, matchId }) {
  const [selectedStand, setSelectedStand] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const inr = n => '₹' + Number(n).toLocaleString('en-IN');

  return (
    <div className="stadium-viewer-layout" style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr', 
      gap: '24px', 
      marginTop: '20px' 
    }}>
      <style>{`
        @media (min-width: 950px) {
          .stadium-viewer-layout { grid-template-columns: 1fr 380px !important; }
        }
      `}</style>

      {/* MAP */}
      <div className="map-section">
        <StadiumMap 
          stadiumData={stadiumData}
          selectedId={selectedStand?.id || null}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={setSelectedStand}
        />
      </div>

      {/* INFO PANEL */}
      <div className="info-panel" style={{ 
        background: '#ffffff', 
        padding: '28px', 
        borderRadius: '16px', 
        border: '1px solid #f0dada',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}>
        {!selectedStand ? (
          <div style={{ textAlign: 'center', color: '#b07070', paddingTop: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏟</div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '1px' }}>
              SELECT A SECTOR TO VIEW DETAILS
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '38px', margin: 0, color: '#1a0000', letterSpacing: '1px' }}>
              {selectedStand.name}
            </h2>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#e63329', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '2px', marginTop: '4px' }}>
              {selectedStand.type}
            </p>
            
            <div style={{ height: '1px', background: 'linear-gradient(90deg, #e63329 0%, #ffffff 100%)', margin: '24px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#fcfcfc', padding: '16px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                <small style={{ fontSize: '9px', color: '#999', fontFamily: 'JetBrains Mono' }}>CAPACITY</small>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px' }}>{selectedStand.cap.toLocaleString()}</div>
              </div>
              <div style={{ background: '#fff9f9', padding: '16px', borderRadius: '12px', border: '1px solid #fde8e8' }}>
                <small style={{ fontSize: '9px', color: '#e63329', fontFamily: 'JetBrains Mono' }}>BASE PRICE</small>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: '#e63329' }}>{inr(selectedStand.base)}</div>
              </div>
            </div>

            <button style={{ 
              width: '100%', 
              marginTop: '32px', 
              padding: '18px', 
              background: 'linear-gradient(135deg, #e63329, #c0392b)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'Bebas Neue',
              fontSize: '22px',
              letterSpacing: '3px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(230, 51, 41, 0.25)',
              transition: 'transform 0.2s'
            }}
            onClick={() => setShowModal(true)}
            onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              BOOK SEATS NOW
            </button>
          </div>
        )}
      </div>

      {showModal && selectedStand && (
        <SeatGridModal 
          matchId={matchId} 
          standData={selectedStand} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}