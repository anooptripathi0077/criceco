import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { backendAPI, aiAPI } from "../services/api";

// --- Premium Custom Icons ---
const SearchIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const CameraIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    className="w-12 h-12 text-slate-300 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export default function SecurityScan() {
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState(null);
  const [liveImage, setLiveImage] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const webcamRef = useRef(null);

  const handleLookupTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await backendAPI.get(`/security/ticket/${ticketId}`);
      setTicketData(res.data);
      setLiveImage(null);
      setVerificationResult(null);
    } catch (error) {
      alert(error.response?.data?.message || "Ticket not found");
      setTicketData(null);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setLiveImage(imageSrc);
  }, [webcamRef]);

  const handleVerify = async () => {
    setIsProcessing(true);
    try {
      const storedEmbedding = JSON.parse(ticketData.face_embedding);
      const res = await aiAPI.post("/verify-face", {
        live_image_base64: liveImage,
        stored_embedding: storedEmbedding,
      });
      setVerificationResult(res.data);
    } catch (error) {
      alert("AI Verification failed. Ensure the face is clearly visible.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#e2e9f0] font-['Inter',sans-serif] text-slate-900 pb-20 pt-8">
      {/* ── Header Section ── */}
      <header className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Access Control System
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
          Security <span className="text-blue-600">Scanner</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium">
          Verify passenger biometrics against secure database records.
        </p>
      </header>

      {/* ── Main Layout (Grid) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: Data Entry & Ticket Info ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Step 1: Lookup Box */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider mb-5 font-['JetBrains_Mono']">
                  Ticket Lookup
                </h2>

                <form
                  onSubmit={handleLookupTicket}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Scan or Enter ID..."
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-300 shadow-md flex items-center justify-center cursor-pointer gap-2"
                  >
                    <SearchIcon />
                    Retrieve Record
                  </button>
                </form>
              </div>
            </div>

            {/* Passenger Record Box */}
            <div
              className={`bg-white rounded-[2rem] shadow-sm border overflow-hidden transition-all duration-500 ${ticketData ? "border-blue-200 ring-4 ring-blue-50" : "border-slate-200"}`}
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider mb-5 font-['JetBrains_Mono']">
                  User Record
                </h2>

                {ticketData ? (
                  <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                    <div>
                      <p className="text-xl text-slate-600 font-bold uppercase tracking-wider mb-1 font-['JetBrains_Mono']">
                        User Name
                      </p>
                      <p className="text-xl text-slate-900 font-bold">
                        {ticketData.user_name}
                      </p>
                    </div>
                   
                    <div className="pt-4 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wide border border-green-200">
                        {ticketData.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 font-medium text-sm">
                    Awaiting ticket ID input to retrieve passenger data.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Biometric Scanner ── */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-md border border-slate-200 overflow-hidden h-full min-h-[600px] flex flex-col">
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider font-['JetBrains_Mono']">
                  Biometric Scan
                </h2>
                {ticketData && (
                  <span className="flex items-center gap-2 text-xs font-bold text-blue-600 animate-pulse bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    CAMERA LIVE
                  </span>
                )}
              </div>

              <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
                {/* Empty State */}
                {!ticketData && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <LockIcon />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Scanner Locked
                    </h3>
                    <p className="text-slate-500 max-w-sm">
                      Please retrieve a passenger record in Step 1 to unlock the
                      biometric camera.
                    </p>
                  </div>
                )}

                {/* Active Camera State */}
                {ticketData && !liveImage && (
                  <div className="w-full max-w-2xl mx-auto animate-[fadeIn_0.4s_ease-out]">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
                      {/* HUD Crosshairs */}
                      <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg z-10 opacity-70"></div>
                      <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg z-10 opacity-70"></div>
                      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg z-10 opacity-70"></div>
                      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg z-10 opacity-70"></div>

                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-auto block opacity-90"
                      />
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[scanline_2s_linear_infinite]" />
                    </div>

                    <button
                      onClick={capture}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center cursor-pointer transform hover:-translate-y-1 text-lg"
                    >
                      <CameraIcon />
                      Capture Live Face
                    </button>
                  </div>
                )}

                {/* Captured State */}
                {ticketData && liveImage && (
                  <div className="w-full max-w-2xl mx-auto animate-[fadeIn_0.4s_ease-out]">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800 mb-6">
                      <img
                        src={liveImage}
                        alt="Captured face"
                        className="w-full h-auto block"
                      />
                    </div>

                    <div className="flex gap-4 mb-8">
                      <button
                        onClick={() => setLiveImage(null)}
                        className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-4 px-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Retake Photo
                      </button>
                      <button
                        onClick={handleVerify}
                        disabled={isProcessing}
                        className={`flex-[2] text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg text-lg ${
                          isProcessing
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-slate-900 hover:bg-blue-600 cursor-pointer shadow-slate-900/20 hover:-translate-y-1"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                            Analyzing Biometrics...
                          </>
                        ) : (
                          <>
                            <ShieldIcon />
                            Verify Identity
                          </>
                        )}
                      </button>
                    </div>

                    {/* Verification Result - Keeps Semantic Green/Red colors for clear pass/fail UX */}
                    {verificationResult && (
                      <div
                        className={`p-8 rounded-2xl border-2 shadow-sm animate-[fadeUp_0.4s_ease-out] ${verificationResult.match ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"}`}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          {verificationResult.match ? (
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          )}
                          <h3
                            className={`text-2xl font-black tracking-tight ${verificationResult.match ? "text-green-800" : "text-red-800"}`}
                          >
                            {verificationResult.match
                              ? "IDENTITY CONFIRMED"
                              : "IDENTITY MISMATCH"}
                          </h3>
                        </div>
                        <p
                          className={`text-base font-semibold ${verificationResult.match ? "text-green-700" : "text-red-700"} pl-16`}
                        >
                          Confidence Score:{" "}
                          <span className="font-black text-lg">
                            {(
                              verificationResult.similarity_score * 100
                            ).toFixed(2)}
                            %
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tailwind Custom Animations */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          50% { transform: translateY(400px); }
          100% { transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
