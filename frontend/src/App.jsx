import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import UserPortal from './pages/UserPortal';
import Checkout from './pages/Checkout'; 
import Login from './pages/Login';
import MyTickets from './pages/MyTickets';
import SecurityScan from './pages/SecurityScan';
import AdminDashboard from './pages/AdminDashboard';
import { backendAPI } from './services/api';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await backendAPI.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await backendAPI.post('/auth/logout');
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#666' }}>Loading SecureSeat...</div>;

  const isLoggedIn = !!user;
  const userRole = user?.role || 'User';

  return (
    <Router>
      <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '20px' }}>
        
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🎟️</span> SecureSeat
            </h2>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <a href="/" style={{ textDecoration: 'none', color: '#34495e', fontWeight: 'bold' }}>Matches</a>
                
                {isLoggedIn ? (
                    <>
                        <a href="/my-tickets" style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold' }}>My Tickets</a>
                        {userRole === 'Security' && <a href="/security" style={{ textDecoration: 'none', color: '#e74c3c', fontWeight: 'bold' }}>Security Scanner</a>}
                        {userRole === 'Admin' && <a href="/admin" style={{ textDecoration: 'none', color: '#f39c12', fontWeight: 'bold' }}>Admin Panel</a>}
                        
                        <div style={{ position: 'relative' }} ref={menuRef}>
                          <div 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{ 
                              width: '35px', 
                              height: '35px', 
                              borderRadius: '50%', 
                              backgroundColor: '#3498db', 
                              color: 'white', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            {user.email.charAt(0).toUpperCase()}
                          </div>

                          {isMenuOpen && (
                            <div style={{ 
                              position: 'absolute', 
                              top: '120%', 
                              right: 0, 
                              backgroundColor: 'white', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                              borderRadius: '8px', 
                              padding: '15px', 
                              minWidth: '200px', 
                              zIndex: 1000,
                              border: '1px solid #eee'
                            }}>
                              <div style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '2px' }}>Signed in as</div>
                                <div style={{ fontWeight: 'bold', color: '#2c3e50', wordBreak: 'break-all' }}>{user.email}</div>
                              </div>
                              <button 
                                onClick={handleLogout} 
                                style={{ 
                                  width: '100%',
                                  padding: '8px', 
                                  backgroundColor: '#fff', 
                                  color: '#e74c3c', 
                                  border: '1px solid #e74c3c', 
                                  borderRadius: '4px', 
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.color = '#fff'; }}
                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#e74c3c'; }}
                              >
                                Logout
                              </button>
                            </div>
                          )}
                        </div>
                    </>
                ) : (
                    <a href="/login" style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold' }}>Login</a>
                )}
            </div>
        </nav>

        <Routes>
          <Route path="/" element={<UserPortal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout/:matchId/:seatId" element={isLoggedIn ? <Checkout /> : <Navigate to="/login" />} />
          <Route path="/my-tickets" element={isLoggedIn ? <MyTickets /> : <Navigate to="/login" />} />
          <Route path="/security" element={<SecurityScan />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;