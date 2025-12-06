// // // import logo from './logo.svg';
// // // import './App.css';

// // // function App() {
// // //   return (
// // //     <div className="App">
// // //       <header className="App-header">
// // //         <img src={logo} className="App-logo" alt="logo" />
// // //         <p>
// // //           Edit <code>src/App.js</code> and save to reload.
// // //         </p>
// // //         <a
// // //           className="App-link"
// // //           href="https://reactjs.org"
// // //           target="_blank"
// // //           rel="noopener noreferrer"
// // //         >
// // //           Learn React
// // //         </a>
// // //       </header>
// // //     </div>
// // //   );
// // // }

// // // export default App;

// // import React, { useState } from "react";

// // // Single-file React component (default export) for a simple registration -> payment flow.
// // // Usage:
// // // 1) Create a React app (Create React App or Next.js). This file can be used as src/App.jsx (CRA)
// // // 2) Tailwind CSS classes are used for styling. If you don't have Tailwind, you can replace classes
// // //    with your own CSS or use Bootstrap class names.
// // // 3) Payment here is mocked for demo purposes. See the // TODO comments where you'd call your backend
// // //    to create a real payment session (eg. Stripe Checkout).

// // export default function App() {
// //   const [step, setStep] = useState("landing"); // landing, form, payment, success
// //   const [form, setForm] = useState({ name: "", email: "", age: "", qualification: "" });
// //   const [errors, setErrors] = useState({});
// //   const [submitting, setSubmitting] = useState(false);
// //   const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, succeeded, failed

// //   function openForm() {
// //     setStep("form");
// //   }

// //   function onChange(e) {
// //     const { name, value } = e.target;
// //     setForm((s) => ({ ...s, [name]: value }));
// //   }

// //   function validate() {
// //     const err = {};
// //     if (!form.name.trim()) err.name = "Name is required";
// //     if (!form.email.trim()) err.email = "Email is required";
// //     // basic email check
// //     if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Invalid email";
// //     if (!form.age.trim()) err.age = "Age is required";
// //     if (form.age && (!/^[0-9]+$/.test(form.age) || Number(form.age) <= 0)) err.age = "Enter a valid age";
// //     if (!form.qualification.trim()) err.qualification = "Qualification is required";
// //     return err;
// //   }

// //   async function submitForm(e) {
// //     e.preventDefault();
// //     const v = validate();
// //     setErrors(v);
// //     if (Object.keys(v).length > 0) return;

// //     setSubmitting(true);

// //     try {
// //       // In a real app: POST form to your backend to create a registration record.
// //       // Example (uncomment + implement backend):
// //       // const resp = await fetch('/api/registrations', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) });
// //       // const data = await resp.json(); // contains registration_id, amount, etc.

// //       // For this demo, we'll simulate a saved registration and then move to payment step.
// //       await new Promise((r) => setTimeout(r, 700));
// //       setStep("payment");
// //     } catch (err) {
// //       console.error(err);
// //       alert("Failed to submit form. See console for details.");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   }

// //   async function handleMockPayment() {
// //     setPaymentStatus("processing");

// //     try {
// //       // === REAL PAYMENT INTEGRATION (example with Stripe) ===
// //       // You should create a checkout session on your backend and then redirect to Stripe Checkout.
// //       // const resp = await fetch('/api/create-checkout-session', {
// //       //   method: 'POST', headers: {'Content-Type':'application/json'},
// //       //   body: JSON.stringify({ registration: form, amount_cents: 1000 })
// //       // });
// //       // const { url } = await resp.json();
// //       // window.location.href = url; // redirect to Stripe-hosted checkout
// //       // ======================================================

// //       // Mock payment: wait then succeed
// //       await new Promise((r) => setTimeout(r, 1200));
// //       setPaymentStatus("succeeded");
// //       setStep("success");

// //       // Optionally: call backend to mark registration as paid (if using backend)
// //       // await fetch(`/api/registrations/${registrationId}/mark-paid`, { method: 'POST' })
// //     } catch (err) {
// //       console.error(err);
// //       setPaymentStatus("failed");
// //       alert("Payment failed (mock). Check console.");
// //     }
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
// //       <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
// //         {step === "landing" && (
// //           <div>
// //             <h1 className="text-2xl font-semibold mb-4">Welcome — Registration & Payment Demo</h1>
// //             <p className="text-gray-600 mb-6">Click the button below to start your registration.</p>
// //             <button
// //               onClick={openForm}
// //               className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
// //             >
// //               Register
// //             </button>
// //           </div>
// //         )}

// //         {step === "form" && (
// //           <div>
// //             <h2 className="text-xl font-medium mb-4">Registration Form</h2>
// //             <form onSubmit={submitForm} className="space-y-4">
// //               <div>
// //                 <label className="block text-sm font-medium">Full name</label>
// //                 <input
// //                   name="name"
// //                   value={form.name}
// //                   onChange={onChange}
// //                   className="mt-1 w-full border rounded px-3 py-2"
// //                 />
// //                 {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium">Email</label>
// //                 <input
// //                   name="email"
// //                   value={form.email}
// //                   onChange={onChange}
// //                   className="mt-1 w-full border rounded px-3 py-2"
// //                 />
// //                 {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
// //               </div>

// //               <div className="grid grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium">Age</label>
// //                   <input
// //                     name="age"
// //                     value={form.age}
// //                     onChange={onChange}
// //                     className="mt-1 w-full border rounded px-3 py-2"
// //                   />
// //                   {errors.age && <div className="text-red-500 text-sm mt-1">{errors.age}</div>}
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium">Qualification</label>
// //                   <input
// //                     name="qualification"
// //                     value={form.qualification}
// //                     onChange={onChange}
// //                     className="mt-1 w-full border rounded px-3 py-2"
// //                   />
// //                   {errors.qualification && (
// //                     <div className="text-red-500 text-sm mt-1">{errors.qualification}</div>
// //                   )}
// //                 </div>
// //               </div>

// //               <div className="flex items-center gap-3">
// //                 <button
// //                   type="submit"
// //                   disabled={submitting}
// //                   className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
// //                 >
// //                   {submitting ? "Saving..." : "Submit & Continue to Payment"}
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={() => setStep("landing")}
// //                   className="px-4 py-2 border rounded-lg"
// //                 >
// //                   Cancel
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         )}

// //         {step === "payment" && (
// //           <div>
// //             <h2 className="text-xl font-medium mb-4">Payment</h2>
// //             <p className="text-gray-700 mb-4">Registration saved. Please complete the payment to finish.</p>

// //             <div className="p-4 border rounded mb-4">
// //               <div className="flex justify-between items-center">
// //                 <div>
// //                   <div className="text-sm text-gray-500">Item</div>
// //                   <div className="font-medium">Registration Fee</div>
// //                 </div>
// //                 <div className="text-lg font-semibold">₹499</div>
// //               </div>
// //             </div>

// //             <div className="flex items-center gap-3">
// //               <button
// //                 onClick={handleMockPayment}
// //                 disabled={paymentStatus === "processing"}
// //                 className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
// //               >
// //                 {paymentStatus === "processing" ? "Processing…" : "Pay ₹499 (Demo)"}
// //               </button>

// //               <button onClick={() => setStep("form")} className="px-4 py-2 border rounded-lg">
// //                 Back to Form
// //               </button>
// //             </div>

// //             <div className="mt-4 text-sm text-gray-500">
// //               <p>
// //                 <strong>Note:</strong> This is a demo payment button. To integrate a real gateway (Stripe,
// //                 Razorpay, etc.) create a payment session on your backend and redirect the user to the payment
// //                 page. See comments in the source for the sample code lines.
// //               </p>
// //             </div>
// //           </div>
// //         )}

// //         {step === "success" && (
// //           <div className="text-center">
// //             <h2 className="text-2xl font-semibold mb-2 text-green-600">Payment Successful 🎉</h2>
// //             <p className="text-gray-700 mb-4">Thank you, your registration and payment are complete.</p>

// //             <div className="text-left bg-gray-50 border rounded p-4 text-sm">
// //               <div className="mb-2"><strong>Name:</strong> {form.name}</div>
// //               <div className="mb-2"><strong>Email:</strong> {form.email}</div>
// //               <div className="mb-2"><strong>Age:</strong> {form.age}</div>
// //               <div className="mb-2"><strong>Qualification:</strong> {form.qualification}</div>
// //             </div>

// //             <div className="mt-6 flex justify-center gap-3">
// //               <button onClick={() => { setStep('landing'); setForm({ name: '', email: '', age: '', qualification: '' }); setPaymentStatus('idle'); }} className="px-5 py-2 bg-gray-200 rounded">Done</button>
// //               <button onClick={() => window.print()} className="px-5 py-2 bg-indigo-600 text-white rounded">Print Receipt</button>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }


// import React, { useState, useEffect } from "react";

// // Change this if your backend runs on a different URL/port
// const BACKEND_URL = "http://localhost:4242";

// export default function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
//   const [authError, setAuthError] = useState("");
//   const [authForm, setAuthForm] = useState({
//   name: "",
//   email: "",
//   password: "",
//   });

//   const [step, setStep] = useState("landing"); // landing, form, payment, success, admin
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     age: "",
//     qualification: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, succeeded, failed

//   // Store data returned from backend
//   const [registrationId, setRegistrationId] = useState(null);
//   const [amountCents, setAmountCents] = useState(null);
//   const [currency, setCurrency] = useState("INR");

//   // Admin data
//   const [adminLoading, setAdminLoading] = useState(false);
//   const [adminError, setAdminError] = useState("");
//   const [registrations, setRegistrations] = useState([]);

//   function openForm() {
//     setStep("form");
//   }

//   function openAdmin() {
//     setStep("admin");
//     loadAdminData();
//   }

//   function onChange(e) {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   }

//   function validate() {
//     const err = {};
//     if (!form.name.trim()) err.name = "Name is required";
//     if (!form.email.trim()) err.email = "Email is required";
//     if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//       err.email = "Invalid email";
//     }
//     if (!form.age.trim()) err.age = "Age is required";
//     if (
//       form.age &&
//       (!/^[0-9]+$/.test(form.age) || Number(form.age) <= 0)
//     ) {
//       err.age = "Enter a valid age";
//     }
//     if (!form.qualification.trim()) {
//       err.qualification = "Qualification is required";
//     }
//     return err;
//   }

//   async function submitForm(e) {
//     e.preventDefault();
//     const v = validate();
//     setErrors(v);
//     if (Object.keys(v).length > 0) return;

//     setSubmitting(true);

//     try {
//       // 👉 Call backend API to create registration in DB
//       const response = await fetch(`${BACKEND_URL}/api/registrations`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(form),
//       });

//       if (!response.ok) {
//         console.error("Failed to save registration", response.status);
//         alert("Failed to save registration. Please try again.");
//         return;
//       }

//       const data = await response.json();
//       // data.registration, data.amount_cents, data.currency

//       setRegistrationId(data.registration.id);
//       setAmountCents(data.amount_cents);
//       setCurrency(data.currency || "INR");

//       // Move to payment step
//       setStep("payment");
//     } catch (err) {
//       console.error("Error calling backend:", err);
//       alert("Error connecting to server. Is backend running?");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   async function handleMockPayment() {
//     setPaymentStatus("processing");

//     try {
//       // Demo payment only
//       await new Promise((resolve) => setTimeout(resolve, 1200));
//       setPaymentStatus("succeeded");
//       setStep("success");
//     } catch (err) {
//       console.error(err);
//       setPaymentStatus("failed");
//       alert("Payment failed (mock).");
//     }
//   }

//   function resetAll() {
//     setStep("landing");
//     setForm({ name: "", email: "", age: "", qualification: "" });
//     setErrors({});
//     setSubmitting(false);
//     setPaymentStatus("idle");
//     setRegistrationId(null);
//     setAmountCents(null);
//   }

//   const amountDisplay =
//     amountCents != null ? (amountCents / 100).toFixed(2) : "499.00";

//   // ===== ADMIN: load data from backend =====
//   async function loadAdminData() {
//     setAdminLoading(true);
//     setAdminError("");
//     try {
//       const resp = await fetch(`${BACKEND_URL}/api/admin/registrations`);
//       if (!resp.ok) {
//         throw new Error("Failed to load registrations");
//       }
//       const data = await resp.json();
//       setRegistrations(data.registrations || []);
//     } catch (err) {
//       console.error("Admin load error:", err);
//       setAdminError("Could not load registrations. Check server.");
//     } finally {
//       setAdminLoading(false);
//     }
//   }

//   async function handleLogin(e) {
//   e.preventDefault();
//   setAuthError("");

//   try {
//     const resp = await fetch(`${BACKEND_URL}/api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: authForm.email,
//         password: authForm.password,
//       }),
//     });

//     const data = await resp.json();
//     if (!resp.ok) {
//       setAuthError(data.error || "Login failed");
//       return;
//     }

//     setCurrentUser(data.user);
//     // Save to localStorage so refresh doesn't lose it
//     localStorage.setItem("currentUser", JSON.stringify(data.user));
//     setStep("landing");
//   } catch (err) {
//     console.error("Login error", err);
//     setAuthError("Error connecting to server");
//   }
// }

// async function handleSignup(e) {
//   e.preventDefault();
//   setAuthError("");

//   try {
//     const resp = await fetch(`${BACKEND_URL}/api/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name: authForm.name,
//         email: authForm.email,
//         password: authForm.password,
//       }),
//     });

//     const data = await resp.json();
//     if (!resp.ok) {
//       setAuthError(data.error || "Signup failed");
//       return;
//     }

//     setCurrentUser(data.user);
//     localStorage.setItem("currentUser", JSON.stringify(data.user));
//     setStep("landing");
//   } catch (err) {
//     console.error("Signup error", err);
//     setAuthError("Error connecting to server");
//   }
// }


//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
//         {/* Simple header with navigation */}
//         {/* <div className="flex justify-between items-center mb-6 border-b pb-3">
//           <h1 className="text-2xl font-semibold">Registration & Payment</h1>
//           <div className="flex gap-3">
//             <button
//               onClick={() => setStep("landing")}
//               className={`px-3 py-1 rounded text-sm ${
//                 step === "landing" || step === "form" || step === "payment" || step === "success"
//                   ? "bg-indigo-50 text-indigo-700"
//                   : "bg-gray-100 text-gray-600"
//               }`}
//             >
//               User View
//             </button>
//             <button
//               onClick={openAdmin}
//               className={`px-3 py-1 rounded text-sm ${
//                 step === "admin"
//                   ? "bg-indigo-600 text-white"
//                   : "bg-gray-100 text-gray-600"
//               }`}
//             >
//               Admin View (Temp)
//             </button>
//           </div>
//         </div> */
        
//           <div className="flex justify-between items-center mb-6 border-b pb-3">
//             <h1 className="text-2xl font-semibold">Registration & Payment</h1>
//               <div className="flex gap-3 items-center">
//                 {currentUser ? (
//                   <>
//                     <span className="text-sm text-gray-700">
//                       Hello, {currentUser.name} ({currentUser.role})
//                     </span>
//                     <button
//                       onClick={() => setStep("landing")}
//                       className={`px-3 py-1 rounded text-sm ${
//                       step === "landing" ||
//                       step === "form" ||
//                       step === "payment" ||
//                       step === "success"
//                         ? "bg-indigo-50 text-indigo-700"
//                         : "bg-gray-100 text-gray-600"
//                     }`}
//                   >
//                     User View
//                   </button>

//                   {currentUser.role === "admin" && (
//                     <button
//                       onClick={() => {
//                         setStep("admin");
//                         loadAdminData();
//                       }}
//                       className={`px-3 py-1 rounded text-sm ${
//                         step === "admin"
//                           ? "bg-indigo-600 text-white"
//                           : "bg-gray-100 text-gray-600"
//                       }`}
//                     >
//                     Admin
//                   </button>
//                 )}

//                 <button
//                   onClick={logout}
//                   className="px-3 py-1 rounded text-sm bg-red-100 text-red-700"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={() => setStep("auth")}
//                 className="px-3 py-1 rounded text-sm bg-indigo-600 text-white"
//               >
//                 Login / Signup
//               </button>
//             )}
//           </div>
//         </div>
//         }



//         {/* USER FLOWS */}
//         {/* {step === "landing" && (
//           <div>
//             <p className="text-gray-600 mb-6">
//               Click the button below to start your registration.
//             </p>
//             <button
//               onClick={openForm}
//               className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//             >
//               Register
//             </button>
//           </div>
//         )}

//         {step === "form" && (
//           <div>
//             <h2 className="text-xl font-medium mb-4">Registration Form</h2>
//             <form onSubmit={submitForm} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium">Full name</label>
//                 <input
//                   name="name"
//                   value={form.name}
//                   onChange={onChange}
//                   className="mt-1 w-full border rounded px-3 py-2"
//                 />
//                 {errors.name && (
//                   <div className="text-red-500 text-sm mt-1">
//                     {errors.name}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Email</label>
//                 <input
//                   name="email"
//                   value={form.email}
//                   onChange={onChange}
//                   className="mt-1 w-full border rounded px-3 py-2"
//                 />
//                 {errors.email && (
//                   <div className="text-red-500 text-sm mt-1">
//                     {errors.email}
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium">Age</label>
//                   <input
//                     name="age"
//                     value={form.age}
//                     onChange={onChange}
//                     className="mt-1 w-full border rounded px-3 py-2"
//                   />
//                   {errors.age && (
//                     <div className="text-red-500 text-sm mt-1">
//                       {errors.age}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium">
//                     Qualification
//                   </label>
//                   <input
//                     name="qualification"
//                     value={form.qualification}
//                     onChange={onChange}
//                     className="mt-1 w-full border rounded px-3 py-2"
//                   />
//                   {errors.qualification && (
//                     <div className="text-red-500 text-sm mt-1">
//                       {errors.qualification}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
//                 >
//                   {submitting ? "Saving..." : "Submit & Continue to Payment"}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setStep("landing")}
//                   className="px-4 py-2 border rounded-lg"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )} */}

//         {step === "landing" && (
//           <div>
//             {!currentUser ? (
//               <p className="text-gray-600 mb-6">
//                 Please{" "}
//                 <button
//                   className="text-indigo-600 underline"
//                   onClick={() => setStep("auth")}
//                 >
//                   login or sign up
//                 </button>{" "}
//                 to register.
//               </p>
//             ) : (
//               <>
//                 <p className="text-gray-600 mb-6">
//                   Click the button below to start your registration.
//                 </p>
//                 <button
//                   onClick={openForm}
//                   className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                 >
//                   Register
//                 </button>
//               </>
//             )}
//           </div>
//         )}



//         {step === "payment" && (
//           <div>
//             <h2 className="text-xl font-medium mb-4">Payment</h2>
//             <p className="text-gray-700 mb-2">
//               Registration saved in database with ID:{" "}
//               <span className="font-mono font-semibold">
//                 {registrationId}
//               </span>
//             </p>
//             <p className="text-gray-700 mb-4">
//               Please complete the payment to finish.
//             </p>

//             <div className="p-4 border rounded mb-4">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <div className="text-sm text-gray-500">Item</div>
//                   <div className="font-medium">Registration Fee</div>
//                 </div>
//                 <div className="text-lg font-semibold">
//                   {currency === "INR" ? "₹" : ""}
//                   {amountDisplay}
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleMockPayment}
//                 disabled={paymentStatus === "processing"}
//                 className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
//               >
//                 {paymentStatus === "processing"
//                   ? "Processing…"
//                   : `Pay ${currency === "INR" ? "₹" : ""}${amountDisplay} (Demo)`}
//               </button>

//               <button
//                 onClick={() => setStep("form")}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Back to Form
//               </button>
//             </div>

//             <div className="mt-4 text-sm text-gray-500">
//               <p>
//                 <strong>Note:</strong> This is a demo payment button. Your
//                 registration is already saved in the database. Later we can
//                 connect this to real Stripe or Razorpay checkout.
//               </p>
//             </div>
//           </div>
//         )}

//         {step === "success" && (
//           <div className="text-center">
//             <h2 className="text-2xl font-semibold mb-2 text-green-600">
//               Payment Successful 🎉
//             </h2>
//             <p className="text-gray-700 mb-4">
//               Thank you, your registration and (demo) payment are complete.
//             </p>

//             <div className="text-left bg-gray-50 border rounded p-4 text-sm">
//               <div className="mb-2">
//                 <strong>Registration ID:</strong> {registrationId}
//               </div>
//               <div className="mb-2">
//                 <strong>Name:</strong> {form.name}
//               </div>
//               <div className="mb-2">
//                 <strong>Email:</strong> {form.email}
//               </div>
//               <div className="mb-2">
//                 <strong>Age:</strong> {form.age}
//               </div>
//               <div className="mb-2">
//                 <strong>Qualification:</strong> {form.qualification}
//               </div>
//             </div>

//             <div className="mt-6 flex justify-center gap-3">
//               <button
//                 onClick={resetAll}
//                 className="px-5 py-2 bg-gray-200 rounded"
//               >
//                 Done
//               </button>
//               <button
//                 onClick={() => window.print()}
//                 className="px-5 py-2 bg-indigo-600 text-white rounded"
//               >
//                 Print Receipt
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ADMIN VIEW */}

//         {step === "auth" && (
//           <div className="max-w-md">
//             <h2 className="text-xl font-medium mb-4">
//               {authMode === "login" ? "Login" : "Sign Up"}
//             </h2>

//             {authError && (
//               <div className="mb-3 text-sm text-red-600">{authError}</div>
//             )}

//             <form
//               onSubmit={authMode === "login" ? handleLogin : handleSignup}
//               className="space-y-4"
//             >
//               {authMode === "signup" && (
//                 <div>
//                   <label className="block text-sm font-medium">Name</label>
//                   <input
//                     name="name"
//                     value={authForm.name}
//                     onChange={onAuthChange}
//                     className="mt-1 w-full border rounded px-3 py-2"
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-medium">Email</label>
//                 <input
//                   name="email"
//                   value={authForm.email}
//                   onChange={onAuthChange}
//                   className="mt-1 w-full border rounded px-3 py-2"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={authForm.password}
//                   onChange={onAuthChange}
//                   className="mt-1 w-full border rounded px-3 py-2"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
//               >
//                 {authMode === "login" ? "Login" : "Sign Up"}
//               </button>
//             </form>

//             <div className="mt-3 text-sm">
//               {authMode === "login" ? (
//                 <span>
//                   Don&apos;t have an account?{" "}
//                   <button
//                     onClick={() => setAuthMode("signup")}
//                     className="text-indigo-600 underline"
//                   >
//                     Sign up
//                   </button>
//                 </span>
//               ) : (
//                 <span>
//                   Already have an account?{" "}
//                   <button
//                     onClick={() => setAuthMode("login")}
//                     className="text-indigo-600 underline"
//                   >
//                     Login
//                   </button>
//                 </span>
//               )}
//             </div>
//           </div>
//         )}


//         {step === "admin" && (
//           <div>
//             <h2 className="text-xl font-medium mb-4">Admin — Registrations</h2>

//             {adminLoading && <p>Loading registrations...</p>}
//             {adminError && (
//               <p className="text-red-600 mb-3">{adminError}</p>
//             )}

//             {!adminLoading && registrations.length === 0 && !adminError && (
//               <p className="text-gray-600">No registrations found yet.</p>
//             )}

//             {!adminLoading && registrations.length > 0 && (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="border px-2 py-1">ID</th>
//                       <th className="border px-2 py-1">Name</th>
//                       <th className="border px-2 py-1">Email</th>
//                       <th className="border px-2 py-1">Age</th>
//                       <th className="border px-2 py-1">Qualification</th>
//                       <th className="border px-2 py-1">Status</th>
//                       <th className="border px-2 py-1">Created At</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {registrations.map((r) => (
//                       <tr key={r.id}>
//                         <td className="border px-2 py-1">{r.id}</td>
//                         <td className="border px-2 py-1">{r.name}</td>
//                         <td className="border px-2 py-1">{r.email}</td>
//                         <td className="border px-2 py-1">{r.age}</td>
//                         <td className="border px-2 py-1">{r.qualification}</td>
//                         <td className="border px-2 py-1">
//                           <span
//                             className={
//                               r.status === "paid"
//                                 ? "text-green-600 font-semibold"
//                                 : "text-yellow-700"
//                             }
//                           >
//                             {r.status}
//                           </span>
//                         </td>
//                         <td className="border px-2 py-1 text-xs">
//                           {r.created_at}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             <div className="mt-4">
//               <button
//                 onClick={loadAdminData}
//                 className="px-4 py-2 border rounded-lg text-sm"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function onAuthChange(e) {
//   const { name, value } = e.target;
//   setAuthForm((prev) => ({ ...prev, [name]: value }));
// }

// async function handleLogin(e) {
//   e.preventDefault();
//   setAuthError("");

//   try {
//     const resp = await fetch(`${BACKEND_URL}/api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: authForm.email,
//         password: authForm.password,
//       }),
//     });

//     const data = await resp.json();
//     if (!resp.ok) {
//       setAuthError(data.error || "Login failed");
//       return;
//     }

//     setCurrentUser(data.user);
//     // Save to localStorage so refresh doesn't lose it
//     localStorage.setItem("currentUser", JSON.stringify(data.user));
//     setStep("landing");
//   } catch (err) {
//     console.error("Login error", err);
//     setAuthError("Error connecting to server");
//   }
// }

// async function handleSignup(e) {
//   e.preventDefault();
//   setAuthError("");

//   try {
//     const resp = await fetch(`${BACKEND_URL}/api/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name: authForm.name,
//         email: authForm.email,
//         password: authForm.password,
//       }),
//     });

//     const data = await resp.json();
//     if (!resp.ok) {
//       setAuthError(data.error || "Signup failed");
//       return;
//     }

//     setCurrentUser(data.user);
//     localStorage.setItem("currentUser", JSON.stringify(data.user));
//     setStep("landing");
//   } catch (err) {
//     console.error("Signup error", err);
//     setAuthError("Error connecting to server");
//   }
// }

// function logout() {
//   setCurrentUser(null);
//   localStorage.removeItem("currentUser");
//   setStep("auth"); // go to login/signup
// }






import React, { useState, useEffect } from "react";

// Change this if your backend runs on a different URL/port
const BACKEND_URL = "http://localhost:4242";

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // App flow
  const [step, setStep] = useState("landing"); // landing, auth, form, payment, success, admin

  // Registration form
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    qualification: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, succeeded, failed

  // Data from backend
  const [registrationId, setRegistrationId] = useState(null);
  const [amountCents, setAmountCents] = useState(null);
  const [currency, setCurrency] = useState("INR");

  // Admin data
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [registrations, setRegistrations] = useState([]);

  // Load user from localStorage on first load
  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // ------- Handlers -------

  function onAuthChange(e) {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  }

  function openForm() {
    setStep("form");
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const err = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.email.trim()) err.email = "Email is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      err.email = "Invalid email";
    }
    if (!form.age.trim()) err.age = "Age is required";
    if (form.age && (!/^[0-9]+$/.test(form.age) || Number(form.age) <= 0)) {
      err.age = "Enter a valid age";
    }
    if (!form.qualification.trim()) {
      err.qualification = "Qualification is required";
    }
    return err;
  }

  async function submitForm(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        console.error("Failed to save registration", response.status);
        alert("Failed to save registration. Please try again.");
        return;
      }

      const data = await response.json();

      setRegistrationId(data.registration.id);
      setAmountCents(data.amount_cents);
      setCurrency(data.currency || "INR");

      setStep("payment");
    } catch (err) {
      console.error("Error calling backend:", err);
      alert("Error connecting to server. Is backend running?");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMockPayment() {
    setPaymentStatus("processing");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setPaymentStatus("succeeded");
      setStep("success");
    } catch (err) {
      console.error(err);
      setPaymentStatus("failed");
      alert("Payment failed (mock).");
    }
  }

  function resetAll() {
    setStep("landing");
    setForm({ name: "", email: "", age: "", qualification: "" });
    setErrors({});
    setSubmitting(false);
    setPaymentStatus("idle");
    setRegistrationId(null);
    setAmountCents(null);
  }

  const amountDisplay =
    amountCents != null ? (amountCents / 100).toFixed(2) : "499.00";

  // ADMIN: load data from backend
  async function loadAdminData() {
    setAdminLoading(true);
    setAdminError("");
    try {
      const resp = await fetch(`${BACKEND_URL}/api/admin/registrations`);
      if (!resp.ok) {
        throw new Error("Failed to load registrations");
      }
      const data = await resp.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error("Admin load error:", err);
      setAdminError("Could not load registrations. Check server.");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");

    try {
      const resp = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setAuthError(data.error || "Login failed");
        return;
      }

      setCurrentUser(data.user);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setStep("landing");
    } catch (err) {
      console.error("Login error", err);
      setAuthError("Error connecting to server");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setAuthError("");

    try {
      const resp = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setAuthError(data.error || "Signup failed");
        return;
      }

      setCurrentUser(data.user);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setStep("landing");
    } catch (err) {
      console.error("Signup error", err);
      setAuthError("Error connecting to server");
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setStep("auth");
  }

  // ------- JSX -------

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-semibold">Registration & Payment</h1>
          <div className="flex gap-3 items-center">
            {currentUser ? (
              <>
                <span className="text-sm text-gray-700">
                  Hello, {currentUser.name} ({currentUser.role})
                </span>
                <button
                  onClick={() => setStep("landing")}
                  className={`px-3 py-1 rounded text-sm ${
                    step === "landing" ||
                    step === "form" ||
                    step === "payment" ||
                    step === "success"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  User View
                </button>

                {currentUser.role === "admin" && (
                  <button
                    onClick={() => {
                      setStep("admin");
                      loadAdminData();
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      step === "admin"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Admin
                  </button>
                )}

                <button
                  onClick={logout}
                  className="px-3 py-1 rounded text-sm bg-red-100 text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep("auth")}
                className="px-3 py-1 rounded text-sm bg-indigo-600 text-white"
              >
                Login / Signup
              </button>
            )}
          </div>
        </div>

        {/* AUTH SCREEN */}
        {step === "auth" && (
          <div className="max-w-md">
            <h2 className="text-xl font-medium mb-4">
              {authMode === "login" ? "Login" : "Sign Up"}
            </h2>

            {authError && (
              <div className="mb-3 text-sm text-red-600">{authError}</div>
            )}

            <form
              onSubmit={authMode === "login" ? handleLogin : handleSignup}
              className="space-y-4"
            >
              {authMode === "signup" && (
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    name="name"
                    value={authForm.name}
                    onChange={onAuthChange}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  value={authForm.email}
                  onChange={onAuthChange}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={onAuthChange}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
              >
                {authMode === "login" ? "Login" : "Sign Up"}
              </button>
            </form>

            <div className="mt-3 text-sm">
              {authMode === "login" ? (
                <span>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setAuthMode("signup")}
                    className="text-indigo-600 underline"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="text-indigo-600 underline"
                  >
                    Login
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* LANDING (only useful if not in auth) */}
        {step === "landing" && (
          <div>
            {!currentUser ? (
              <p className="text-gray-600 mb-6">
                Please{" "}
                <button
                  className="text-indigo-600 underline"
                  onClick={() => setStep("auth")}
                >
                  login or sign up
                </button>{" "}
                to register.
              </p>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Click the button below to start your registration.
                </p>
                <button
                  onClick={openForm}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}

        {/* REGISTRATION FORM */}
        {step === "form" && (
          <div>
            <h2 className="text-xl font-medium mb-4">Registration Form</h2>
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Full name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Age</label>
                  <input
                    name="age"
                    value={form.age}
                    onChange={onChange}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.age && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.age}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Qualification
                  </label>
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={onChange}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.qualification && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.qualification}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Submit & Continue to Payment"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("landing")}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PAYMENT */}
        {step === "payment" && (
          <div>
            <h2 className="text-xl font-medium mb-4">Payment</h2>
            <p className="text-gray-700 mb-2">
              Registration saved in database with ID:{" "}
              <span className="font-mono font-semibold">
                {registrationId}
              </span>
            </p>
            <p className="text-gray-700 mb-4">
              Please complete the payment to finish.
            </p>

            <div className="p-4 border rounded mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Item</div>
                  <div className="font-medium">Registration Fee</div>
                </div>
                <div className="text-lg font-semibold">
                  {currency === "INR" ? "₹" : ""}
                  {amountDisplay}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMockPayment}
                disabled={paymentStatus === "processing"}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {paymentStatus === "processing"
                  ? "Processing…"
                  : `Pay ${currency === "INR" ? "₹" : ""}${amountDisplay} (Demo)`}
              </button>

              <button
                onClick={() => setStep("form")}
                className="px-4 py-2 border rounded-lg"
              >
                Back to Form
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                <strong>Note:</strong> This is a demo payment button. Your
                registration is already saved in the database. Later we can
                connect this to real Stripe or Razorpay checkout.
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-green-600">
              Payment Successful 🎉
            </h2>
            <p className="text-gray-700 mb-4">
              Thank you, your registration and (demo) payment are complete.
            </p>

            <div className="text-left bg-gray-50 border rounded p-4 text-sm">
              <div className="mb-2">
                <strong>Registration ID:</strong> {registrationId}
              </div>
              <div className="mb-2">
                <strong>Name:</strong> {form.name}
              </div>
              <div className="mb-2">
                <strong>Email:</strong> {form.email}
              </div>
              <div className="mb-2">
                <strong>Age:</strong> {form.age}
              </div>
              <div className="mb-2">
                <strong>Qualification:</strong> {form.qualification}
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={resetAll}
                className="px-5 py-2 bg-gray-200 rounded"
              >
                Done
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 text-white rounded"
              >
                Print Receipt
              </button>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {step === "admin" && (
          <div>
            <h2 className="text-xl font-medium mb-4">Admin — Registrations</h2>

            {adminLoading && <p>Loading registrations...</p>}
            {adminError && (
              <p className="text-red-600 mb-3">{adminError}</p>
            )}

            {!adminLoading && registrations.length === 0 && !adminError && (
              <p className="text-gray-600">No registrations found yet.</p>
            )}

            {!adminLoading && registrations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">ID</th>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Email</th>
                      <th className="border px-2 py-1">Age</th>
                      <th className="border px-2 py-1">Qualification</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        <td className="border px-2 py-1">{r.id}</td>
                        <td className="border px-2 py-1">{r.name}</td>
                        <td className="border px-2 py-1">{r.email}</td>
                        <td className="border px-2 py-1">{r.age}</td>
                        <td className="border px-2 py-1">{r.qualification}</td>
                        <td className="border px-2 py-1">
                          <span
                            className={
                              r.status === "paid"
                                ? "text-green-600 font-semibold"
                                : "text-yellow-700"
                            }
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="border px-2 py-1 text-xs">
                          {r.created_at}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={loadAdminData}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
