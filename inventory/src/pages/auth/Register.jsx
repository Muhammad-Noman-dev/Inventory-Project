// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API from '../../api';
// import toast from 'react-hot-toast';
// import { UserPlus, Eye, EyeOff, Package } from 'lucide-react';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: ''
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await API.post('/admin/register', formData);
      
//       if (res.data.success) {
//         toast.success("OTP sent to your email! Please verify.");
//         navigate('/verify-otp', { state: { email: formData.email } });
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.msg || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:40px_40px] opacity-30"></div>

//       <div className="w-full max-w-md relative z-10">
//         {/* Register Card */}
//         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white text-center">
//             <div className="flex justify-center mb-4">
//               <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
//                 <UserPlus size={48} className="text-white" />
//               </div>
//             </div>
//             <h1 className="text-3xl font-bold tracking-tight">Create Admin Account</h1>
//             <p className="text-blue-100 mt-2 text-lg">Set up your inventory management access</p>
//           </div>

//           {/* Form Area */}
//           <div className="p-8 lg:p-10">
//             <form onSubmit={handleRegister} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-base"
//                   placeholder="John Doe"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-base"
//                   placeholder="admin@example.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-base pr-12"
//                     placeholder="Create a strong password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//                   >
//                     {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg hover:brightness-105 active:scale-[0.985] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 mt-8"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
//                     Creating Account...
//                   </>
//                 ) : (
//                   <>
//                     <UserPlus size={22} />
//                     Create Admin Account
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>

//           {/* Footer */}
//           <div className="border-t border-gray-100 px-8 py-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <span 
//                 onClick={() => navigate('/login')}
//                 className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors"
//               >
//                 Sign in
//               </span>
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

// export default Register;