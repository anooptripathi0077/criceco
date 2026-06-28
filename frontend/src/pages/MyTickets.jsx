import React, { useState, useEffect } from 'react';
import { backendAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// --- Premium Custom SVG Icons ---
const CalendarIcon = () => (
  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const TicketEmptyIcon = () => (
  <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

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

    // Safely upgraded PDF Download Function using html-to-image
    const handleDownloadPDF = async (ticket) => {
        setDownloadingId(ticket.ticket_id);
        
        try {
            const ticketElement = document.getElementById(`ticket-${ticket.ticket_id}`);
            if (!ticketElement) throw new Error("Could not find the ticket on the screen.");

            // 1. Hide the button safely
            const btn = ticketElement.querySelector('.download-btn');
            if (btn) btn.style.display = 'none';

            // 2. Wait a tiny fraction of a second for the DOM to update
            await new Promise(resolve => setTimeout(resolve, 100));

            // 3. Take the screenshot using the modern html-to-image library
            const dataUrl = await toPng(ticketElement, {
                quality: 1,
                pixelRatio: 2, // High resolution
                backgroundColor: '#ffffff'
            });

            // 4. Bring the button back
            if (btn) btn.style.display = 'flex';

            // 5. Generate PDF
            const pdf = new jsPDF('landscape', 'mm', 'a4'); 
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            // Calculate height using the element's actual dimensions
            const pdfHeight = (ticketElement.offsetHeight * pdfWidth) / ticketElement.offsetWidth;
            
            pdf.addImage(dataUrl, 'PNG', 0, 10, pdfWidth, pdfHeight);
            pdf.save(`SecureSeat_Ticket_${ticket.ticket_id}.pdf`);
            
        } catch (err) {
            console.error("🚨 DETAILED PDF ERROR:", err);
            alert(`PDF Error: ${err.message}. Check your console!`);
        } finally {
            setDownloadingId(null);
            
            // Backup safety: ensure button comes back even if it crashes
            const ticketElement = document.getElementById(`ticket-${ticket.ticket_id}`);
            if (ticketElement) {
                const btn = ticketElement.querySelector('.download-btn');
                if (btn) btn.style.display = 'flex';
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[85vh] text-lg text-slate-500 font-['Inter'] bg-[#F8FAFC]">
            <div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mr-3" />
            Locating your tickets...
        </div>
    );

    if (error) return (
        <div className="min-h-[85vh] bg-[#F8FAFC] flex justify-center pt-20 px-4 font-['Inter',sans-serif]">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm text-center">
                <p className="font-semibold">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-[85vh] bg-[#e2e9f0] font-['Inter',sans-serif] text-slate-900 pb-20 pt-8 px-4 sm:px-6 lg:px-8">
            
            {/* ── Header ── */}
            <header className="max-w-5xl mx-auto mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                        My Tickets
                    </h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto">
                {tickets.length === 0 ? (
                    /* ── Empty State ── */
                    <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-16 text-center shadow-sm flex flex-col items-center">
                        <TicketEmptyIcon />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No Tickets Found</h3>
                        <p className="text-slate-500 mb-8 max-w-md">You haven't booked any matches yet. Discover upcoming fixtures and secure your seats today.</p>
                        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-300 shadow-md">
                            Browse Matches
                        </Link>
                    </div>
                ) : (
                    /* ── Tickets List ── */
                    <div className="space-y-10">
                        {tickets.map(ticket => (
                            <div 
                                key={ticket.ticket_id} 
                                id={`ticket-${ticket.ticket_id}`}
                                className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden relative border border-slate-200 group hover:shadow-2xl transition-shadow duration-500"
                            >
                                {/* Left Side: Match & Seat Details (The Pass) */}
                                <div className="p-0 md:w-[70%] flex flex-col relative bg-gradient-to-br from-white to-slate-50">
                                    
                                    {/* Top Info Bar */}
                                    <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                                                ticket.status === 'Valid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {ticket.status === 'Valid' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                                {ticket.status}
                                            </span>
                                            {ticket.tier_name === 'VIP' && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
                                                    ★ VIP PASS
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xl font-bold  text-slate-900 uppercase tracking-widest font-['JetBrains_Mono']">
                                            TICKET NO: {String(ticket.ticket_id).padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="p-8 flex-grow flex flex-col justify-center">
                                        {/* Huge Team Names */}
                                        <div className="mb-8">
                                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                                                {ticket.team_a} <span className="text-blue-500 font-medium text-2xl md:text-4xl italic mx-1">vs</span> {ticket.team_b}
                                            </h3>
                                        </div>

                                        {/* Printed Ticket Data Grid */}
                                        <div className="grid grid-cols-4 border-y border-slate-200 bg-slate-100/50 divide-x divide-slate-200 mb-8">
                                            <div className="p-4 text-center">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-['JetBrains_Mono']">Stand</p>
                                                <p className="text-sm md:text-base font-bold text-slate-900 truncate">{ticket.stand_name}</p>
                                            </div>
                                            <div className="p-4 text-center">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-['JetBrains_Mono']">Tier</p>
                                                <p className={`text-sm md:text-base font-bold truncate ${ticket.tier_name === 'VIP' ? 'text-amber-600' : 'text-slate-900'}`}>{ticket.tier_name}</p>
                                            </div>
                                            <div className="p-4 text-center">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-['JetBrains_Mono']">Block</p>
                                                <p className="text-sm md:text-base font-bold text-slate-900 truncate">{ticket.block_name}</p>
                                            </div>
                                            <div className="p-4 text-center bg-blue-50 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-blue-500/5" />
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 font-['JetBrains_Mono'] relative z-10">Row / Seat</p>
                                                <p className="text-lg md:text-xl font-black text-blue-700 relative z-10">{ticket.row_id}-{ticket.seat_number}</p>
                                            </div>
                                        </div>

                                        {/* Venue & Time Footer */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                                                    <CalendarIcon />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date & Time</p>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">
                                                        {new Date(ticket.match_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} <br/>
                                                        <span className="text-slate-500 font-medium">{new Date(ticket.match_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                                                    <LocationIcon />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Venue</p>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">
                                                        {ticket.stadium_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Barcode Stub (Perforated Edge) */}
                                <div className="md:w-[30%] bg-slate-900 relative flex flex-col justify-between items-center p-8 text-white overflow-hidden">
                                    
                                    {/* Subtle Background Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                                        <span className="text-6xl font-black transform -rotate-90 whitespace-nowrap tracking-widest">SECURESEAT</span>
                                    </div>

                                    {/* The Perforated Edge line */}
                                    <div className="hidden md:block absolute top-0 left-0 w-px h-full border-l-2 border-dashed border-slate-700/50" />
                                    
                                    {/* Cutout circles to simulate torn paper */}
                                    <div className="hidden md:block absolute -top-5 -left-5 w-10 h-10 bg-[#F8FAFC] rounded-full border-b border-r border-slate-200 z-10 shadow-inner" />
                                    <div className="hidden md:block absolute -bottom-5 -left-5 w-10 h-10 bg-[#F8FAFC] rounded-full border-t border-r border-slate-200 z-10 shadow-inner" />
                                    
                                    {/* Stub Header */}
                                    <div className="text-center w-full relative z-10 pt-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-['JetBrains_Mono']">Scan at Gate</p>
                                        <p className="text-xs text-slate-500 font-medium mb-8">Have this ready for security</p>
                                        
                                        {/* High-Fidelity Realistic Fake Barcode */}
                                        <div className="w-full h-24 bg-white rounded-lg mb-3 flex items-center justify-between px-3 py-2 opacity-90 shadow-inner">
                                            {[...Array(24)].map((_, i) => (
                                                <div key={i} className={`bg-slate-900 rounded-sm ${
                                                    i % 7 === 0 ? 'w-2 h-full' : 
                                                    i % 5 === 0 ? 'w-1.5 h-full' : 
                                                    i % 3 === 0 ? 'w-1 h-[80%]' : 
                                                    'w-0.5 h-[90%]'
                                                }`} />
                                            ))}
                                        </div>
                                        
                                        {/* Ticket ID Text */}
                                        <p className="text-2xl font-black tracking-[0.3em] font-['JetBrains_Mono'] text-white mb-8">
                                            {String(ticket.ticket_id).padStart(8, '0')}
                                        </p>
                                    </div>

                                    {/* Download Button */}
                                    <div className="w-full relative z-10">
                                        <button 
                                            onClick={() => handleDownloadPDF(ticket)}
                                            disabled={downloadingId === ticket.ticket_id}
                                            className="download-btn w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5 cursor-pointer border border-blue-400/30"
                                        >
                                            {downloadingId === ticket.ticket_id ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <DownloadIcon />
                                                    Save as PDF
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
};

export default MyTickets;