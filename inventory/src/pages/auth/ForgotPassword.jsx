// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API from '../../api';
// import toast from 'react-hot-toast';
// import { KeyRound, Eye, EyeOff } from 'lucide-react';

// const ForgotPassword = () => {
//   const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   // Step 1: Request OTP
//   const handleSendOTP = async (e) => {
//     e.preventDefault();
//     if (!email) {
//       toast.error('Please enter your email');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await API.post('/admin/forgot-password', { email });
//       if (res.data.success) {
//         toast.success(res.data.msg || 'OTP sent to your email');
//         setStep(2);
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.msg || 'Failed to send OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Verify OTP
//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     if (otp.length !== 6) {
//       toast.error('Please enter a valid 6-digit OTP');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await API.post('/admin/verify-reset-otp', { email, otp });
//       if (res.data.success) {
//         toast.success('OTP verified successfully');
//         setStep(3);
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.msg || 'Invalid or expired OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 3: Reset Password
//   const handleResetPassword = async (e) => {
//     e.preventDefault();

//     if (newPassword.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await API.post('/admin/reset-password', { email, newPassword });
//       if (res.data.success) {
//         toast.success('Password reset successfully! Please login.');
//         navigate('/login');
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.msg || 'Failed to reset password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:40px_40px] opacity-30"></div>

//       <div className="w-full max-w-md relative z-10">
//         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white text-center">
//             <div className="flex justify-center mb-4">
//               <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
//                 <KeyRound size={48} className="text-white" />
//               </div>
//             </div>
//             <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
//             <p className="text-blue-100 mt-2">
//               {step === 1 && 'Enter your email to receive an OTP'}
//               {step === 2 && 'Enter the OTP sent to your email'}
//               {step === 3 && 'Create your new password'}
//             </p>
//           </div>

//           {/* Form Area */}
//           <div className="p-8 lg:p-10">
//             {/* Step 1: Email */}
//             {step === 1 && (
//               <form onSubmit={handleSendOTP} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-base"
//                     placeholder="admin@example.com"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg hover:brightness-105 active:scale-[0.985] transition-all duration-200 disabled:opacity-70 shadow-lg shadow-blue-500/30"
//                 >
//                   {loading ? 'Sending OTP...' : 'Send OTP'}
//                 </button>
//               </form>
//             )}

//             {/* Step 2: OTP */}
//             {step === 2 && (
//               <form onSubmit={handleVerifyOTP} className="space-y-6">
//                 <p className="text-center text-gray-600 text-sm mb-2">
//                   We sent a code to <span className="font-medium text-gray-800">{email}</span>
//                 </p>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
//                     Enter 6-Digit OTP
//                   </label>
//                   <input
//                     type="text"
//                     maxLength={6}
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//                     className="w-full px-8 py-6 border border-gray-300 rounded-2xl text-center text-4xl tracking-[12px] font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
//                     placeholder="••••••"
//                     required
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading || otp.length !== 6}
//                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg hover:brightness-105 active:scale-[0.985] transition-all duration-200 disabled:opacity-70 shadow-lg shadow-blue-500/30"
//                 >
//                   {loading ? 'Verifying...' : 'Verify OTP'}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setStep(1)}
//                   className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
//                 >
//                   ← Change Email
//                 </button>
//               </form>
//             )}

//             {/* Step 3: New Password */}
//             {step === 3 && (
//               <form onSubmit={handleResetPassword} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     New Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       required
//                       className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-base pr-12"
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//                     >
//                       {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Confirm New Password
//                   </label>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     required
//                     className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-base"
//                     placeholder="••••••••"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg hover:brightness-105 active:scale-[0.985] transition-all duration-200 disabled:opacity-70 shadow-lg shadow-blue-500/30"
//                 >
//                   {loading ? 'Resetting...' : 'Reset Password'}
//                 </button>
//               </form>
//             )}
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

//         <p className="text-center text-gray-400 text-xs mt-6">
//           © 2026 Inventory Management System
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;