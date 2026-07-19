// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import API from '../../api';
// import toast from 'react-hot-toast';
// import { ShieldCheck, Package } from 'lucide-react';

// const VerifyOTP = () => {
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
  
//   const navigate = useNavigate();
//   const location = useLocation();
//   const email = location.state?.email || '';

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     if (otp.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await API.post('/admin/verify-otp', { email, otp });
//       if (res.data.success) {
//         toast.success("Account Verified Successfully!");
//         navigate('/login');
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.msg || "Invalid OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (!email) return;
    
//     setResendLoading(true);
//     try {
//       await API.post('/admin/resend-otp', { email });
//       toast.success("New OTP sent to your email");
//       setOtp(''); // Clear input
//     } catch (err) {
//       toast.error(err.response?.data?.msg || "Failed to resend OTP");
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:40px_40px] opacity-30"></div>

//       <div className="w-full max-w-md relative z-10">
//         {/* Card */}
//         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white text-center">
//             <div className="flex justify-center mb-4">
//               <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
//                 <ShieldCheck size={48} className="text-white" />
//               </div>
//             </div>
//             <h1 className="text-3xl font-bold tracking-tight">Verify Your Email</h1>
//             <p className="text-blue-100 mt-2">Enter the OTP sent to your email</p>
//           </div>

//           {/* Form Area */}
//           <div className="p-8 lg:p-10">
//             {email && (
//               <p className="text-center text-gray-600 mb-8 text-sm">
//                 We sent a code to <span className="font-medium text-gray-800">{email}</span>
//               </p>
//             )}

//             <form onSubmit={handleVerify}>
//               <div className="mb-8">
//                 <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
//                   Enter 6-Digit OTP
//                 </label>
//                 <input
//                   type="text"
//                   maxLength={6}
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
//                   className="w-full px-8 py-6 border border-gray-300 rounded-2xl text-center text-4xl tracking-[12px] font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
//                   placeholder="••••••"
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading || otp.length !== 6}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg hover:brightness-105 active:scale-[0.985] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full inline-block mr-2"></div>
//                     Verifying OTP...
//                   </>
//                 ) : (
//                   "Verify OTP"
//                 )}
//               </button>
//             </form>

//             {/* Resend OTP */}
//             <div className="text-center mt-6">
//               <button
//                 onClick={handleResendOTP}
//                 disabled={resendLoading}
//                 className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
//               >
//                 {resendLoading ? "Sending..." : "Resend OTP"}
//               </button>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="border-t border-gray-100 px-8 py-6 text-center">
//             <p 
//               onClick={() => navigate('/login')}
//               className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
//             >
//               ← Back to Login
//             </p>
//           </div>
//         </div>

//         {/* Bottom Branding */}
//         <p className="text-center text-gray-400 text-xs mt-6">
//           © 2026 Inventory Management System
//         </p>
//       </div>
//     </div>
//   );
// };

// export default VerifyOTP;