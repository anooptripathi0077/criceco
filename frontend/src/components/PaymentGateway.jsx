import React, { useState } from 'react';
import { backendAPI } from '../services/api';
import FakePaymentModal from './FakePaymentModal';

const PaymentGateway = ({ amount, matchId, seatId, onPaymentSuccess, onPaymentFailure, isLoading }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);

    const handleInitiatePayment = async () => {
        setError(null);
        setIsProcessing(true);

        try {
            const response = await backendAPI.post('/payments/create-order', {
                matchId,
                seatId,
                amount
            });

            setCurrentOrderId(response.data.orderId);
            setShowPaymentModal(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = async (paymentData) => {
        try {
            const verificationResponse = await backendAPI.post('/payments/verify-payment', {
                orderId: currentOrderId,
                paymentId: paymentData.fakePaymentId,
                signature: `fake_sig_${Date.now()}`,
                matchId,
                seatId,
                cardName: paymentData.cardName,
                cardNumber: paymentData.cardNumber,
                cardType: paymentData.cardType,
                expiry: paymentData.expiry,
                cvv: paymentData.cvv,
                amount: amount
            });

            setShowPaymentModal(false);
            onPaymentSuccess({
                paymentId: verificationResponse.data.paymentId,
                fakePaymentId: paymentData.fakePaymentId,
                amount: amount,
                lastFourDigits: paymentData.cardNumber.slice(-4)
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
        }
    };

    const handlePaymentFailure = () => {
        setShowPaymentModal(false);
        onPaymentFailure({
            error: 'Payment cancelled by user',
            orderId: `order_${matchId}_${seatId}`
        });
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 relative overflow-hidden">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Order Summary
                        </h3>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Secure Checkout
                        </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 border-dashed">
                            <span className="text-slate-500 font-medium">Total Amount Due</span>
                            <span className="text-3xl font-black text-slate-900">₹ {amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Match Ref: <span className="font-mono text-slate-700 font-medium">{matchId}</span></span>
                            <span className="text-slate-500">Seat: <span className="font-mono text-slate-700 font-medium">{seatId}</span></span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={handleInitiatePayment}
                    disabled={isProcessing || isLoading}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                        isProcessing || isLoading
                            ? 'bg-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-slate-900 hover:bg-blue-600 shadow-slate-900/20 transform hover:-translate-y-0.5 cursor-pointer'
                    }`}
                >
                    {isProcessing || isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Initializing Secure Gateway...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Proceed to Payment
                        </>
                    )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-5 text-slate-400 text-xs font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Encrypted & Secure Transaction
                </div>
            </div>

            {showPaymentModal && (
                <FakePaymentModal
                    amount={amount}
                    matchId={matchId}
                    seatId={seatId}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                />
            )}
        </>
    );
};

export default PaymentGateway;