import React, { useState } from 'react';

const FakePaymentModal = ({ amount, matchId, seatId, onSuccess, onFailure }) => {
    const [step, setStep] = useState('enter-details'); 
    const [cardNumber, setCardNumber] = useState('4111111111111111');
    const [cardName, setCardName] = useState('Test User');
    const [expiry, setExpiry] = useState('12/25');
    const [cvv, setCvv] = useState('123');
    const [isProcessing, setIsProcessing] = useState(false);
    const [simulateFailure, setSimulateFailure] = useState(false);
    const [fakePaymentId, setFakePaymentId] = useState(null);

    const handlePayment = async () => {
        setIsProcessing(true);
        setFakePaymentId(`pay_${Date.now()}`);
        setStep('processing');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        if (simulateFailure) {
            setStep('failure');
            setIsProcessing(false);
        } else {
            setStep('success');
            setIsProcessing(false);
        }
    };

    const formatCardNumber = (value) => {
        return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\s/g, '').slice(0, 16);
        setCardNumber(value);
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        setExpiry(value);
    };

    const handleCVVChange = (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 3);
        setCvv(value);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['Inter',sans-serif]">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-[fadeUp_0.3s_ease-out]">
                
                {/* Step 1: Enter Card Details */}
                {step === 'enter-details' && (
                    <>
                        <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <p className="text-slate-500 font-medium text-sm mb-1">Pay SecureSeat</p>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹ {amount.toFixed(2)}</h2>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="space-y-5">
                                {/* Simulated Card Alert */}
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Test Mode Environment</p>
                                        <p className="text-xs text-slate-500 mt-1">Use the pre-filled mock data or any valid format to simulate a transaction.</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-['JetBrains_Mono']">Card Information</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formatCardNumber(cardNumber)}
                                            onChange={handleCardNumberChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-t-xl text-slate-900 font-medium font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all z-10 relative"
                                            placeholder="Card number"
                                            maxLength="19"
                                        />
                                    </div>
                                    <div className="flex -mt-[1px]">
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={handleExpiryChange}
                                            className="w-1/2 px-4 py-3.5 bg-white border border-slate-200 rounded-bl-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all relative z-0"
                                            placeholder="MM / YY"
                                            maxLength="5"
                                        />
                                        <input
                                            type="password"
                                            value={cvv}
                                            onChange={handleCVVChange}
                                            className="w-1/2 px-4 py-3.5 bg-white border border-slate-200 border-l-0 rounded-br-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all relative z-0"
                                            placeholder="CVC"
                                            maxLength="3"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-['JetBrains_Mono']">Name on card</label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={simulateFailure}
                                                onChange={(e) => setSimulateFailure(e.target.checked)}
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 checked:bg-slate-800 checked:border-slate-800 transition-all cursor-pointer"
                                            />
                                            <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Force payment failure (Testing)</span>
                                    </label>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessing || !cardNumber || !cardName || !expiry || !cvv}
                                        className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Pay ₹{amount.toFixed(2)}
                                    </button>
                                    <button
                                        onClick={onFailure}
                                        className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 2: Processing */}
                {step === 'processing' && (
                    <div className="text-center py-16 px-8 flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Processing...</h3>
                        <p className="text-slate-500 font-medium mt-2">Contacting card issuer securely</p>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                    <div className="text-center py-16 px-8 flex flex-col items-center animate-[fadeIn_0.3s_ease-out]">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-[fadeUp_0.4s_ease-out_0.2s_both]">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Verified!</h3>
                        <p className="text-slate-500 font-medium mt-2 mb-8">Receipt sent to your email.</p>
                        
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 mb-8 text-left">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Amount Paid</span>
                                <span className="font-bold text-slate-900">₹{amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Ref Number</span>
                                <span className="font-mono font-medium text-slate-700">{fakePaymentId}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                onSuccess({
                                    paymentId: Math.floor(Math.random() * 1000000),
                                    fakePaymentId: fakePaymentId,
                                    amount: amount,
                                    cardNumber: cardNumber,
                                    cardName: cardName,
                                    cardType: 'Visa',
                                    expiry: expiry,
                                    cvv: cvv,
                                    timestamp: new Date().toISOString()
                                });
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-600/25 transform hover:-translate-y-0.5"
                        >
                            Generate Tickets →
                        </button>
                    </div>
                )}

                {/* Step 4: Failure */}
                {step === 'failure' && (
                    <div className="text-center py-16 px-8 flex flex-col items-center animate-[fadeIn_0.3s_ease-out]">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-[fadeUp_0.4s_ease-out_0.2s_both]">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Declined</h3>
                        <p className="text-slate-500 font-medium mt-2 mb-8">Your bank declined this transaction.</p>
                        
                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => {
                                    setStep('enter-details');
                                    setSimulateFailure(false);
                                }}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                Try Different Card
                            </button>
                            <button
                                onClick={onFailure}
                                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-xl transition-colors"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default FakePaymentModal;