import React, { useState, useEffect } from "react";
import "./App.css"; // make sure this line is here

// Change this if your backend runs on a different URL/port or use env on Vercel
// const BACKEND_URL =
//   process.env.REACT_APP_API_URL ||
//   "https://weeding-backend-979o.onrender.com";

// const BACKEND_URL = "http://localhost:4242";

const BACKEND_URL = "https://weeding-backend-979o.onrender.com";


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
  const [otp, setOtp] = useState("");


  // Previously abhove code was working but now modified so abhove is commented(due to req change)

  const [form, setForm] = useState({
    // PERSONAL DETAILS
    name: "",
    gender: "",
    age: "",
    religion: "",
    caste: "",
    height: "",
    gotra: "",
    birthPlaceTime: "",
    complexion: "",
    
    // PROFESSIONAL PROFILE
    professionalProfile: "",
    
    // PATERNAL FAMILY
    grandfatherName: "",
    fatherName: "",
    motherName: "",
    
    // MATERNAL FAMILY
    maternalFamily: "",
    
    // CONTACT DETAILS
    mobile: "",
    email: "",
    address: "",
    
    // EXISTING
    qualification: "",
    profession: "",
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
  const [openProfileId, setOpenProfileId] = useState(null);
  const [adminView, setAdminView] = useState("list"); // "list" | "profile"
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [adminScrollY, setAdminScrollY] = useState(0);



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

        // abhov commented ddue to req change
        setForm({
          ...form,
          ...reg,
          age: String(reg.age || ""),
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


  //abhove commented dur to req change
  function validate() {
    const err = {};

    if (!form.name.trim()) err.name = "Name is required";
    if (!form.gender) err.gender = "Gender is required";
    if (!form.email.trim()) err.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      err.email = "Invalid email";
    }

    if (!form.mobile.trim()) err.mobile = "Mobile number is required";

    if (!form.age.trim() || Number(form.age) <= 0) {
      err.age = "Valid age is required";
    }

    return err;
  }

    async function submitForm(e) {
      e.preventDefault();

      const v = validate();
      if (Object.keys(v).length > 0) {
        alert("Age should be greater then zero");
        return;
      }

      setSubmitting(true);

      try {
        const response = await fetch(`${BACKEND_URL}/api/registrations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            age: form.age ? Number(form.age) : undefined,
            userId: currentUser?.id,
          }),
        });

        if (!response.ok) {
          alert("Failed to save registration");
          return;
        }

        const data = await response.json();

        setRegistrationId(data.registration._id);
        setAmountCents(data.amount_cents);
        setCurrency(data.currency || "INR");

        // ✅ CORRECT MERGE
        setForm(prev => ({
          ...prev,
          ...data.registration,
        }));

        setStep("payment");
      } catch (err) {
        alert("Server error");
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

    alert("OTP has been sent to your email. Please verify.");
    setStep("verify-otp");



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

      setStep("verify-otp");

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
                  className="nav-btn nav-btn-primary"
                  onClick={() => {
                    if (step === "verify-otp") return;
                    setStep("auth");
                  }}
                >
                Home
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

          {/* OTP VERIFICATION */}
          {step === "verify-otp" && (
            <div className="max-w-md">
              <h2 className="text-xl font-medium mb-4">
                Verify Your Email
              </h2>

              {authError && (
                <div className="mb-3 text-sm text-red-600">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">
                  Enter 6-digit OTP sent to your email
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>
            <button
              onClick={async () => {
                setAuthError("");

                if (!otp || otp.length !== 6) {
                  setAuthError("Please enter a valid 6-digit OTP");
                  return;
                }

                try {
                  const resp = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: authForm.email,
                      otp,
                    }),
                  });

                  const data = await resp.json();

                  if (!resp.ok) {
                    setAuthError(data.error || "Invalid OTP");
                    return;
                  }

                  // ✅ LOGIN USER AFTER OTP
                  setCurrentUser(data.user);
                  localStorage.setItem("currentUser", JSON.stringify(data.user));

                  // ✅ MOVE TO LANDING
                  setStep("landing");
                } catch (err) {
                  setAuthError("OTP verification failed");
                }
              }}
              className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Verify OTP
            </button>

            </div>
          )}


          {/* LANDING */}
          {step === "landing" && (
            <div>
              {!currentUser ? (
                <p className="text-gray-600 mb-6">
                  Please click hear to register.{" "}
                  <button
                    className="text-indigo-600 underline"
                    // className="nav-btn nav-btn-primary"
                    onClick={() => setStep("auth")}
                    >
                    login or sign up
                  </button>
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
              <form onSubmit={submitForm} className="space-y-4">
              <h3 className="form-section-title">Personal Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="form-label">Name</label>
                  <input name="name" value={form.name} onChange={onChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                    className="form-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.gender}
                  </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Age</label>
                  <input name="age" value={form.age} onChange={onChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label className="form-label">Birth Place & Time</label>
                  <input name="birthPlaceTime" value={form.birthPlaceTime} onChange={onChange} className="form-input" />
                </div>


                <div className="form-field">
                  <label className="form-label">Complexion</label>
                  <input name="complexion" value={form.complexion} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Gotra</label>
                  <input name="gotra" value={form.gotra} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Height</label>
                  <input name="height" value={form.height} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Caste</label>
                  <input name="caste" value={form.caste} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Religion</label>
                  <input name="religion" value={form.religion} onChange={onChange} className="form-input" />
                </div>
              </div>


              <h3 className="form-section-title">Professional Profile</h3>

              <div className="form-field">
                <label className="form-label">Professional Profile</label>
                <textarea
                  name="professionalProfile"
                  value={form.professionalProfile}
                  onChange={onChange}
                  className="form-textarea"
                  rows={4}
                />
              </div>



              <h3 className="form-section-title">Paternal Family</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="form-label">Grandfather's Name</label>
                  <input name="grandfatherName" value={form.grandfatherName} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Father's Name</label>
                  <input name="fatherName" value={form.fatherName} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Mother's Name</label>
                  <input name="motherName" value={form.motherName} onChange={onChange} className="form-input" />
                </div>
              </div>

              <h3 className="form-section-title">Maternal Family</h3>

              <div className="form-field">
                <label className="form-label">Maternal Family Details</label>
                <textarea
                  name="maternalFamily"
                  value={form.maternalFamily}
                  onChange={onChange}
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <h3 className="form-section-title">Contact Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="form-label">Mobile No</label>
                  <input name="mobile" value={form.mobile} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} onChange={onChange} className="form-input" />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <h3 className="form-section-title">Professional Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="form-label">Qualification</label>
                  <input name="qualification" value={form.qualification} onChange={onChange} className="form-input" />
                </div>

                <div className="form-field">
                  <label className="form-label">Profession</label>
                  <input name="profession" value={form.profession} onChange={onChange} className="form-input" />
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
            
            <div className="print-area">
              <h2 className="text-2xl font-semibold mb-2 text-green-600 text-center">
                🎉 Payment Successful 🎉
              </h2>

              <p className="text-gray-700 mb-6 text-center">
                Thank you, your registration and payment are complete.
              </p>

              <div className="text-sm mb-4">
                <strong>Registration ID:</strong> {registrationId}
              </div>

              {/* PERSONAL DETAILS */}
              <h3 className="form-section-title">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {form.name}</div>
                <div><strong>Gender:</strong> {form.gender}</div>
                <div><strong>Birth Place & Time:</strong> {form.birthPlaceTime}</div>
                <div><strong>Age:</strong> {form.age}</div>
                <div><strong>Complexion:</strong> {form.complexion}</div>
                <div><strong>Gotra:</strong> {form.gotra}</div>
                <div><strong>Height:</strong> {form.height}</div>
                <div><strong>Caste:</strong> {form.caste}</div>
                <div><strong>Religion:</strong> {form.religion}</div>
              </div>

              {/* PROFESSIONAL PROFILE */}
              <h3 className="form-section-title">Professional Profile</h3>
              <div><strong>Professional Profile Details:</strong> {form.professionalProfile}</div>

              {/* PATERNAL FAMILY */}
              <h3 className="form-section-title">Paternal Family</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Grandfather's Name:</strong> {form.grandfatherName}</div>
                <div><strong>Father's Name:</strong> {form.fatherName}</div>
                <div><strong>Mother's Name:</strong> {form.motherName}</div>
              </div>

              {/* MATERNAL FAMILY */}
              <h3 className="form-section-title">Maternal Family</h3>
              <div><strong>Maternal Family Details:</strong> {form.maternalFamily}</div>
              

              {/* CONTACT DETAILS */}
              <h3 className="form-section-title">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Mobile:</strong> {form.mobile}</div>
                <div><strong>Email:</strong> {form.email}</div>
                <div><strong>Address:</strong> {form.address}</div>
              </div>

              {/* Professional Details */}
              <h3 className="form-section-title">Professional Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Qualification:</strong> {form.qualification}</div>
                <div><strong>Profession:</strong> {form.profession}</div>
              </div>

              {/* ACTIONS */}
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
                <div className="print-footer-spacer"></div>
              </div>
            </div>
          )}





          {/* ADMIN VIEW: with side panel */}
          {/* =========================
            ADMIN VIEW
          ========================= */}
          {step === "admin" && (
            <div className="admin-page">

              {/* ======================
                ADMIN SUMMARY NAV BAR
              ======================= */}
              <div className="admin-summary-container">

                <h3 className="dashboard-title">Dashboard Summary</h3>

                <div className="admin-summary-bar">

                  <div className="summary-card">
                    <div className="summary-label">Total Registrations</div>
                    <div className="summary-value">{totalRegistrations}</div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-label">Paid</div>
                    <div className="summary-value">{paidCount}</div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-label">Pending</div>
                    <div className="summary-value">{pendingCount}</div>
                  </div>

                  <button
                    onClick={loadAdminData}
                    className="summary-refresh-btn"
                  >
                    {adminLoading ? "Refreshing..." : "Refresh Data"}
                  </button>

                </div>
              </div>

              {/* ======================
                ADMIN LIST VIEW
              ======================= */}
              {adminView === "list" && (
                <div className="admin-table-wrapper">

                  {adminLoading && (
                    <div className="flex items-center gap-2 text-sm p-3">
                      <Spinner /> Loading registrations...
                    </div>
                  )}

                  {adminError && (
                    <p className="text-red-600 p-3">{adminError}</p>
                  )}

                  {!adminLoading && registrations.length === 0 && !adminError && (
                    <p className="text-gray-600 p-3">
                      No registrations found yet.
                    </p>
                  )}

                  {!adminLoading && registrations.length > 0 && (
                    <div className="admin-table-scroll">
                      <table className="admin-table min-w-[3000px]">

                        <thead>
                          <tr>
                            <th>View</th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Age</th>
                            <th>Height</th>
                            <th>Caste</th>
                            <th>Religion</th>
                            <th>Birth Place & Time</th>
                            <th>Complexion</th>
                            <th>Gotra</th>
                            <th>Professional Profile</th>
                            <th>Grandfather</th>
                            <th>Father</th>
                            <th>Mother</th>
                            <th>Maternal Family</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Qualification</th>
                            <th>Profession</th>
                            <th>Status</th>
                            <th>Created</th>
                          </tr>
                        </thead>

                        <tbody>
                          {registrations.map((r) => (
                            <tr key={r._id}>

                              {/* VIEW BUTTON */}
                              <td>
                                <button
                                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded"
                                  onClick={() => {
                                    setSelectedRegistration(r);
                                    setAdminView("profile");
                                  }}
                                >
                                  View
                                </button>
                              </td>

                              <td>{r._id}</td>
                              <td>{r.name}</td>
                              <td>{r.gender || "-"}</td>
                              <td>{r.age || "-"}</td>
                              <td>{r.height || "-"}</td>
                              <td>{r.caste || "-"}</td>
                              <td>{r.religion || "-"}</td>
                              <td>{r.birthPlaceTime || "-"}</td>
                              <td>{r.complexion || "-"}</td>
                              <td>{r.gotra || "-"}</td>
                              <td title={r.professionalProfile}>
                                {r.professionalProfile || "-"}
                              </td>

                              <td>{r.grandfatherName || "-"}</td>
                              <td>{r.fatherName || "-"}</td>
                              <td>{r.motherName || "-"}</td>

                              <td title={r.maternalFamily}>
                                {r.maternalFamily || "-"}
                              </td>

                              <td>{r.mobile || "-"}</td>
                              <td>{r.email}</td>

                              <td title={r.address}>
                                {r.address || "-"}
                              </td>

                              <td>{r.qualification || "-"}</td>
                              <td>{r.profession || "-"}</td>

                              <td>
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

                              <td>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </td>

                            </tr>
                          ))}
                        </tbody>

                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ======================
                ADMIN PROFILE VIEW
              ====================== */}
              {adminView === "profile" && selectedRegistration && (
                <div className="admin-profile-view admin-profile-scroll">

                  <button
                    className="mb-4 px-4 py-2 bg-gray-200 rounded"
                    onClick={() => {
                      setAdminView("list");
                      setSelectedRegistration(null);

                      // restore scroll smoothly
                      requestAnimationFrame(() => {
                        const el = document.querySelector(".admin-table-scroll");
                        if (el) {
                          el.scrollTo({
                            top: adminScrollY,
                            behavior: "smooth",
                          });
                        }
                      });
                    }}
                  >
                    ← Back to Registrations
                  </button>

                  <div className="glass-card">

                    <h2 className="text-xl font-semibold mb-6">
                      Full Registration Profile
                    </h2>

                    {/* =====================
                        PERSONAL DETAILS
                    ===================== */}
                    <h3 className="form-section-title">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Name:</strong> {selectedRegistration.name || "-"}</div>
                      <div><strong>Gender:</strong> {selectedRegistration.gender || "-"}</div>
                      <div><strong>Age:</strong> {selectedRegistration.age || "-"}</div>
                      <div><strong>Height:</strong> {selectedRegistration.height || "-"}</div>
                      <div><strong>Caste:</strong> {selectedRegistration.caste || "-"}</div>
                      <div><strong>Religion:</strong> {selectedRegistration.religion || "-"}</div>
                      <div><strong>Birth Place & Time:</strong> {selectedRegistration.birthPlaceTime || "-"}</div>
                      <div><strong>Complexion:</strong> {selectedRegistration.complexion || "-"}</div>
                      <div><strong>Gotra:</strong> {selectedRegistration.gotra || "-"}</div>
                    </div>

                    {/* =====================
                        PROFESSIONAL PROFILE
                        ===================== */}
                    <h3 className="form-section-title">Professional Profile</h3>
                    <div className="text-sm bg-gray-50 border rounded p-3">
                      {selectedRegistration.professionalProfile || "-"}
                    </div>

                    {/* =====================
                        PATERNAL FAMILY
                        ===================== */}
                    <h3 className="form-section-title">Paternal Family</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Grandfather:</strong> {selectedRegistration.grandfatherName || "-"}</div>
                      <div><strong>Father:</strong> {selectedRegistration.fatherName || "-"}</div>
                      <div><strong>Mother:</strong> {selectedRegistration.motherName || "-"}</div>
                    </div>

                    {/* =====================
                        MATERNAL FAMILY
                        ===================== */}
                    <h3 className="form-section-title">Maternal Family</h3>
                    <div className="text-sm bg-gray-50 border rounded p-3">
                      {selectedRegistration.maternalFamily || "-"}
                    </div>

                    {/* =====================
                        CONTACT DETAILS
                        ===================== */}
                    <h3 className="form-section-title">Contact Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Mobile:</strong> {selectedRegistration.mobile || "-"}</div>
                      <div><strong>Email:</strong> {selectedRegistration.email || "-"}</div>
                      <div className="col-span-2">
                        <strong>Address:</strong> {selectedRegistration.address || "-"}
                      </div>
                    </div>
                    {/* =====================
                        Professional Details
                        ===================== */}
                    <h3 className="form-section-title">Professional Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Qualification:</strong> {selectedRegistration.qualification || "-"}</div>
                        <div><strong>Profession:</strong> {selectedRegistration.profession || "-"}</div>
                    </div>

                    {/* =====================
                        META INFO
                        ===================== */}
                    <h3 className="form-section-title">System Info</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Status:</strong>{" "}
                        <span
                          className={
                            selectedRegistration.status === "paid"
                              ? "text-green-600 font-semibold"
                              : "text-yellow-700"
                          }
                        >
                          {selectedRegistration.status}
                        </span>
                      </div>
                      <div>
                        <strong>Created At:</strong>{" "}
                        {new Date(selectedRegistration.createdAt).toLocaleString()}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
