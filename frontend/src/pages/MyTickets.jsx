import React, { useState, useEffect } from 'react';
import { backendAPI } from '../services/api';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await backendAPI.get('/bookings/my-tickets');
                setTickets(response.data);
            } catch (err) {
                setError('Failed to load tickets. Please log in again.');
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    if (loading) return <div>Loading your tickets...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>🎟️ My Tickets</h2>
            {tickets.length === 0 ? (
                <p>You haven't booked any tickets yet.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {tickets.map(ticket => (
                        <div key={ticket.ticket_id} className="ticket-card">
                            <div className="ticket-header">
                                <h3>{ticket.team_a} vs {ticket.team_b}</h3>
                                <p>{new Date(ticket.match_date).toLocaleString()}</p>
                            </div>
                            <div className="ticket-body">
                                <p><strong>Stadium:</strong> {ticket.stadium_name}</p>
                                <p><strong>Stand:</strong> {ticket.stand_name} ({ticket.tier_name})</p>
                                <p><strong>Block:</strong> {ticket.block_name}</p>
                                <p><strong>Row & Seat:</strong> {ticket.row_id} - Seat {ticket.seat_number}</p>
                                <p><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{ticket.status}</span></p>
                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#eee', textAlign: 'center', borderRadius: '5px' }}>
                                    <small>Ticket ID (Show at Gate)</small>
                                    <h2>#{ticket.ticket_id}</h2>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTickets;