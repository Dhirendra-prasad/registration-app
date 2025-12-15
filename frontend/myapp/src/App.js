import React, { useState, useEffect } from "react";
import "./App.css"; // make sure this line is here

// Change this if your backend runs on a different URL/port or use env on Vercel
const BACKEND_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4242";

// Simple reusable spinner
function Spinner({ size = "md" }) {
  const cls = size === "sm" ? "spinner spinner-sm" : "spinner";
  return <span className={cls} aria-hidden="true" />;
}

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
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

  // Derived admin stats
  const totalRegistrations = registrations.length;
  const paidCount = registrations.filter((r) => r.status === "paid").length;
  const pendingCount = totalRegistrations - paidCount;

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

  // function openForm() {
  //   setStep("form");
  // }


  async function openForm() {
    if (!currentUser) {
      setStep("auth");
      return;
    }

    try {
      const resp = await fetch(
        `${BACKEND_URL}/api/registrations/by-user/${currentUser.id}`
      );

      if (resp.ok) {
        const data = await resp.json();
        const reg = data.registration;
        setForm({
          name: reg.name || "",
          email: reg.email || "",
          age: String(reg.age || ""),
          qualification: reg.qualification || "",
        });
      } else {
        // No registration found, keep empty form
        setForm({
          name: currentUser.name || "",
          email: currentUser.email || "",
          age: "",
          qualification: "",
        });
      }
    } catch (err) {
      console.error("Error loading existing registration:", err);
      // fallback: empty form
    }

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
        body: JSON.stringify({
          ...form,
          userId: currentUser?.id,
        }),

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


  async function handleSignup(e) {
    e.preventDefault();
    setAuthError("");

    // 🔒 Frontend validation for password match
    if (!authForm.password || !authForm.confirmPassword) {
      setAuthError("Please enter and confirm your password.");
      return;
    }
    if (authForm.password !== authForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

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
    <div 
        className={
          step === "admin"
            ? "min-h-screen flex items-center justify-center p-6 admin-bg"
            : "min-h-screen flex items-center justify-center p-6 wedding-bg"
        }
      >

      <div className="w-full max-w-4xl app-shell">
        {/* Top navbar-style header */}
        <div className="app-navbar flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="app-logo">R</div>
            <div>
              <h1 className="text-2xl font-semibold app-title">
                Registration & Payment
              </h1>
              <p className="text-xs text-gray-100 app-subtitle">
                Simple onboarding with secure payments
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {currentUser ? (
              <>
                <div className="text-right text-xs">
                  <div className="font-medium">
                    {currentUser.name}
                  </div>
                  <div className="opacity-80">
                    {currentUser.role === "admin" ? "Admin" : "User"}
                  </div>
                </div>

                <button
                  onClick={() => setStep("landing")}
                  className={`nav-btn ${
                    step === "landing" ||
                    step === "form" ||
                    step === "payment" ||
                    step === "success"
                      ? "nav-btn-active"
                      : ""
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
                    className={`nav-btn ${
                      step === "admin" ? "nav-btn-active" : ""
                    }`}
                  >
                    Admin
                  </button>
                )}

                <button
                  onClick={logout}
                  className="nav-btn nav-btn-danger"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep("auth")}
                className="nav-btn nav-btn-primary"
              >
                Login / Signup
              </button>
            )}
          </div>
        </div>

        {/* Main content card */}
        <div className="w-full glass-card rounded-2xl p-8 mt-4">
          {/* AUTH SCREEN */}
          {step === "auth" && (
            <div className="max-w-md">
              <h2 className="text-xl font-medium mb-4">
                {authMode === "login" ? "Login" : "Sign Up"}
              </h2>

              {authError && (
                <div className="mb-3 text-sm text-red-600">
                  {authError}
                </div>
              )}

              <form
                onSubmit={authMode === "login" ? handleLogin : handleSignup}
                className="space-y-4"
              >
                {authMode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium">
                      Name
                    </label>
                    <input
                      name="name"
                      value={authForm.name}
                      onChange={onAuthChange}
                      className="mt-1 w-full border rounded px-3 py-2"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    name="email"
                    value={authForm.email}
                    onChange={onAuthChange}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={onAuthChange}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>


                {authMode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={authForm.confirmPassword}
                      onChange={onAuthChange}
                      className="mt-1 w-full border rounded px-3 py-2"
                    />
                  </div>
                )}



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

          {/* LANDING */}
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
                  // <div className="glass-card login-glass-card p-6 mb-6 text-center">
                  //   <p className="text-white text-lg font-medium">
                  //     Please{" "}
                  //     <button
                  //       className="px-6 py-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-semibold shadow-[0_4px_20px_rgba(56,178,255,0.45)] hover:shadow-[0_6px_26px_rgba(56,178,255,0.6)] transition-all duration-300"
                  //       onClick={() => setStep('auth')}
                  //     >
                  //       Login / Sign Up
                  //     </button>
                  //     to register.
                  //   </p>
                  // </div>

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
              <h2 className="text-xl font-medium mb-4">
                Registration Form
              </h2>
              <form onSubmit={submitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    Full name
                  </label>
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
                  <label className="block text-sm font-medium">
                    Email
                  </label>
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
                    <label className="block text-sm font-medium">
                      Age
                    </label>
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
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" /> Saving...
                      </span>
                    ) : (
                      "Submit & Continue to Payment"
                    )}
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
                  {paymentStatus === "processing" ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" /> Processing…
                    </span>
                  ) : (
                    `Pay ${currency === "INR" ? "₹" : ""}${amountDisplay} (Demo)`
                  )}
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

          {/* ADMIN VIEW: with side panel */}
          {step === "admin" && (
            <div className="admin-layout">
              {/* Sidebar */}
              <aside className="admin-sidebar">
                <h3 className="text-sm font-semibold mb-3">
                  Dashboard Summary
                </h3>
                <div className="admin-stat-card">
                  <div className="text-xs text-gray-500">
                    Total Registrations
                  </div>
                  <div className="text-xl font-semibold">
                    {totalRegistrations}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="text-xs text-gray-500">Paid</div>
                  <div className="text-xl font-semibold text-green-600">
                    {paidCount}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="text-xs text-gray-500">Pending</div>
                  <div className="text-xl font-semibold text-yellow-700">
                    {pendingCount}
                  </div>
                </div>

                <button
                  onClick={loadAdminData}
                  className="admin-refresh-btn"
                >
                  {adminLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" /> Refreshing...
                    </span>
                  ) : (
                    "Refresh Data"
                  )}
                </button>
              </aside>

              {/* Main admin content */}
              <main className="admin-main">
                <h2 className="text-xl font-medium mb-4">
                  Admin — Registrations
                </h2>

                {adminLoading && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Spinner /> <span>Loading registrations...</span>
                  </div>
                )}

                {adminError && (
                  <p className="text-red-600 mb-3">{adminError}</p>
                )}

                {!adminLoading &&
                  registrations.length === 0 &&
                  !adminError && (
                    <p className="text-gray-600">
                      No registrations found yet.
                    </p>
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
                          <th className="border px-2 py-1">
                            Qualification
                          </th>
                          <th className="border px-2 py-1">Status</th>
                          <th className="border px-2 py-1">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((r) => (
                          <tr key={r.id}>
                            <td className="border px-2 py-1">{r.id}</td>
                            <td className="border px-2 py-1">
                              {r.name}
                            </td>
                            <td className="border px-2 py-1">
                              {r.email}
                            </td>
                            <td className="border px-2 py-1">
                              {r.age}
                            </td>
                            <td className="border px-2 py-1">
                              {r.qualification}
                            </td>
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
              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
