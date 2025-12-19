// // Load environment variables FIRST
// require("dotenv").config();

// // Imports
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// // App initialization
// const app = express();

// // Middleware (ORDER MATTERS)
// app.use(express.json());

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://dhirendra-prasad.github.io",
//       "https://drinkit247.github.io"
//     ],
//     credentials: true,
//   })
// );

// // Models (RELATIVE PATHS)
// const User = require("./models/User");
// const Registration = require("./models/Registration");
// const Payment = require("./models/Payment");

// // Environment variables
// const PORT = process.env.PORT || 4242;
// const MONGO_URI = process.env.MONGODB_URI;

// console.log("MONGO URI =", MONGO_URI);

// // MongoDB connection
// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// // Routes
// app.get("/", (req, res) => {
//   res.send("Backend is running");
// });

// app.post("/test-user", async (req, res) => {
//   try {
//     const user = await User.create({
//       name: "Test User",
//       email: "test@example.com",
//       password: "123456",
//     });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Start server (ONLY ONCE, ALWAYS LAST)
// app.listen(PORT, () => {
//   console.log(`🚀 Server listening on http://localhost:${PORT}`);
// });





// // Helper DB functions
// async function createRegistration({ name, email, age, qualification }) {
//   const sql = `
//     INSERT INTO registrations (name, email, age, qualification, status, created_at)
//     VALUES (?, ?, ?, ?, 'pending', NOW())
//   `;
//   const [result] = await pool.execute(sql, [
//     name,
//     email,
//     age,
//     qualification,
//   ]);
//   return getRegistrationById(result.insertId);
// }

// async function getRegistrationById(id) {
//   const [rows] = await pool.execute(
//     "SELECT * FROM registrations WHERE id = ?",
//     [id]
//   );
//   return rows[0] || null;
// }

// async function updateRegistrationStatus(id, status) {
//   await pool.execute("UPDATE registrations SET status = ? WHERE id = ?", [
//     status,
//     id,
//   ]);
// }

// async function savePayment({
//   registrationId,
//   gateway,
//   gatewayPaymentId,
//   amount_cents,
//   currency,
//   status,
//   raw,
// }) {
//   const sql = `
//     INSERT INTO payments
//       (registration_id, gateway, gateway_payment_id, amount_cents, currency, status, raw_json, created_at)
//     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
//   `;
//   await pool.execute(sql, [
//     registrationId,
//     gateway,
//     gatewayPaymentId,
//     amount_cents || null,
//     currency || null,
//     status,
//     JSON.stringify(raw || {}),
//   ]);
// }

// async function getRegistrationsFiltered({ status, from, to }) {
//   let sql = "SELECT * FROM registrations WHERE 1=1";
//   const params = [];

//   if (status) {
//     sql += " AND status = ?";
//     params.push(status);
//   }
//   if (from) {
//     sql += " AND created_at >= ?";
//     params.push(from);
//   }
//   if (to) {
//     sql += " AND created_at <= ?";
//     params.push(to + " 23:59:59");
//   }

//   sql += " ORDER BY created_at DESC";

//   const [rows] = await pool.execute(sql, params);
//   return rows;
// }

// // ===== 2. Middleware =====
// app.use(cors());
// app.use(express.json());

// // ===== 3. Razorpay env =====
// const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
// const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

// // ===== 4. Routes =====


// // ===== Auth: user signup =====




// app.post("/api/auth/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({ error: "Name, email and password are required" });
//   }

//   try {
//     // 1️⃣ Check if email already exists
//     const [existing] = await pool.execute(
//       "SELECT id FROM users WHERE email = ?",
//       [email]
//     );
//     if (existing.length > 0) {
//       return res.status(400).json({ error: "This email is already registered." });
//     }

//     // 2️⃣ Insert new user
//     const [result] = await pool.execute(
//       `INSERT INTO users (name, email, password, role, created_at)
//        VALUES (?, ?, ?, 'user', NOW())`,
//       [name, email, password]
//     );

//     const user = {
//       id: result.insertId,
//       name,
//       email,
//       role: "user",
//     };

//     res.status(201).json({ user });
//   } catch (err) {
//     console.error("Register error:", err);

//     // Handle duplicate key (extra safety if UNIQUE index exists)
//     if (err.code === "ER_DUP_ENTRY") {
//       return res.status(400).json({ error: "This email is already registered." });
//     }

//     res.status(500).json({ error: "Server error" });
//   }
// });



// app.post("/api/registrations", async (req, res) => {
//   const { name, email, age, qualification, userId } = req.body;

//   if (!userId) {
//     return res.status(400).json({ error: "Missing userId" });
//   }

//   if (!name || !email || !age || !qualification) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   try {
//     // Check if this user already has a registration
//     const [existing] = await pool.execute(
//       "SELECT * FROM registrations WHERE user_id = ?",
//       [userId]
//     );

//     let registration;

//     if (existing.length === 0) {
//       // 1️⃣ First time: insert new registration
//       const [result] = await pool.execute(
//         `INSERT INTO registrations (user_id, name, email, age, qualification, status, created_at)
//          VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
//         [userId, name, email, age, qualification]
//       );

//       registration = {
//         id: result.insertId,
//         user_id: userId,
//         name,
//         email,
//         age,
//         qualification,
//         status: "pending",
//       };
//     } else {
//       // 2️⃣ Already exists: update the existing one
//       const reg = existing[0];
//       await pool.execute(
//         `UPDATE registrations
//          SET name = ?, email = ?, age = ?, qualification = ?, status = 'pending'
//          WHERE id = ?`,
//         [name, email, age, qualification, reg.id]
//       );

//       registration = {
//         ...reg,
//         name,
//         email,
//         age,
//         qualification,
//         status: "pending",
//       };
//     }

//     // Fee logic (same as before)
//     const amountCents = 49900; // or from config
//     const currency = "INR";

//     res.json({
//       registration,
//       amount_cents: amountCents,
//       currency,
//     });
//   } catch (err) {
//     console.error("Error in /api/registrations:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });





// // Get registration for a specific user
// app.get("/api/registrations/by-user/:userId", async (req, res) => {
//   const userId = Number(req.params.userId);
//   if (!userId) {
//     return res.status(400).json({ error: "Invalid user id" });
//   }

//   try {
//     const [rows] = await pool.execute(
//       "SELECT * FROM registrations WHERE user_id = ?",
//       [userId]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "No registration found" });
//     }

//     res.json({ registration: rows[0] });
//   } catch (err) {
//     console.error("Get registration by user error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });









// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ error: "Name, email and password required" });
//     }

//     // check if email already exists
//     const [rows] = await pool.execute(
//       "SELECT id FROM users WHERE email = ?",
//       [email]
//     );
//     if (rows.length > 0) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     const sql = `
//       INSERT INTO users (name, email, password, role, created_at)
//       VALUES (?, ?, ?, 'user', NOW())
//     `;
//     const [result] = await pool.execute(sql, [name, email, password]);

//     const user = {
//       id: result.insertId,
//       name,
//       email,
//       role: "user",
//     };

//     res.json({ user });
//   } catch (err) {
//     console.error("Error in /api/auth/register:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ===== Auth: login (user or admin) =====
// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password required" });
//     }

//     const [rows] = await pool.execute(
//       "SELECT id, name, email, password, role FROM users WHERE email = ?",
//       [email]
//     );

//     if (rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     const user = rows[0];

//     // Simple plain-text comparison for now (not secure, OK for local learning)
//     if (user.password !== password) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Don't send password back
//     delete user.password;

//     res.json({ user });
//   } catch (err) {
//     console.error("Error in /api/auth/login:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// // 4.1 Create registration
// app.post("/api/registrations", async (req, res) => {
//   try {
//     const { name, email, age, qualification } = req.body;

//     if (!name || !email || !age || !qualification) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const registration = await createRegistration({
//       name,
//       email,
//       age: Number(age),
//       qualification,
//     });

//     res.json({
//       registration,
//       amount_cents: 49900,
//       currency: "INR",
//     });
//   } catch (err) {
//     console.error("Error in /api/registrations:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 4.2 Create Razorpay order
// app.post("/api/razorpay/create-order", async (req, res) => {
//   try {
//     const { registrationId, amount_cents, currency } = req.body;

//     if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
//       return res.status(500).json({ error: "Razorpay not configured" });
//     }

//     const registration = await getRegistrationById(registrationId);
//     if (!registration) {
//       return res.status(400).json({ error: "Invalid registrationId" });
//     }

//     const amount = amount_cents || 49900;

//     const resp = await axios.post(
//       "https://api.razorpay.com/v1/orders",
//       {
//         amount,
//         currency: currency || "INR",
//         receipt: `reg_${registrationId}`,
//         payment_capture: 1,
//         notes: {
//           registrationId: String(registrationId),
//         },
//       },
//       {
//         auth: {
//           username: RAZORPAY_KEY_ID,
//           password: RAZORPAY_KEY_SECRET,
//         },
//       }
//     );

//     const order = resp.data;
//     res.json({ order });
//   } catch (err) {
//     console.error(
//       "Razorpay create order failed:",
//       err?.response?.data || err.message
//     );
//     res.status(500).json({ error: "Razorpay order creation failed" });
//   }
// });

// // 4.3 Mark registration as paid
// app.post("/api/registrations/:id/mark-paid", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const registration = await getRegistrationById(id);
//     if (!registration) {
//       return res.status(404).json({ error: "Registration not found" });
//     }

//     await updateRegistrationStatus(id, "paid");
//     await savePayment({
//       registrationId: Number(id),
//       gateway: "razorpay-manual",
//       gatewayPaymentId: null,
//       amount_cents: 49900,
//       currency: "INR",
//       status: "succeeded",
//       raw: { manual: true },
//     });

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error in mark-paid:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 4.4 Get one registration
// app.get("/api/registrations/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const reg = await getRegistrationById(id);
//     if (!reg) return res.status(404).json({ error: "Not found" });
//     res.json({ registration: reg });
//   } catch (err) {
//     console.error("Error in GET /api/registrations/:id", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 4.5 Admin list with filters
// app.get("/api/admin/registrations", async (req, res) => {
//   try {
//     const { status, from, to } = req.query;
//     const rows = await getRegistrationsFiltered({ status, from, to });
//     res.json({ registrations: rows });
//   } catch (err) {
//     console.error("Error in /api/admin/registrations:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 4.6 CSV export
// app.get("/api/admin/registrations/export", async (req, res) => {
//   try {
//     const { status, from, to } = req.query;
//     const rows = await getRegistrationsFiltered({ status, from, to });

//     const header = [
//       "id",
//       "name",
//       "email",
//       "age",
//       "qualification",
//       "status",
//       "created_at",
//     ];

//     function escapeCsv(value) {
//       if (value == null) return "";
//       const str = String(value);
//       if (str.includes(",") || str.includes('"') || str.includes("\n")) {
//         return `"${str.replace(/"/g, '""')}"`;
//       }
//       return str;
//     }

//     const lines = [header.join(",")];
//     for (const r of rows) {
//       lines.push(
//         [
//           r.id,
//           r.name,
//           r.email,
//           r.age,
//           r.qualification,
//           r.status,
//           r.created_at,
//         ]
//           .map(escapeCsv)
//           .join(",")
//       );
//     }

//     const csv = lines.join("\n");
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       'attachment; filename="registrations.csv"'
//     );
//     res.send(csv);
//   } catch (err) {
//     console.error("Error in CSV export:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });





/***********************
 * 1. ENV + IMPORTS
 ***********************/
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

/***********************
 * 2. APP INIT
 ***********************/
const app = express();

/***********************
 * 3. MIDDLEWARE
 ***********************/
app.use(express.json());



app.post("/debug/body", (req, res) => {
  console.log("DEBUG BODY:", req.body);
  res.json({ received: req.body });
});


app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [
          "http://localhost:3000",
          "https://dhirendra-prasad.github.io",
          "https://drinkit247.github.io",
        ],
    credentials: true,
  })
);

// app.options("/*", cors());




// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://dhirendra-prasad.github.io",
//       "https://drinkit247.github.io",
//     ],
//     // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     // allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );





/***********************
 * 4. MODELS
 ***********************/
const User = require("./models/User");
const Registration = require("./models/Registration");

/***********************
 * 5. ENV VARIABLES
 ***********************/
const PORT = process.env.PORT || 4242;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI is missing");
  process.exit(1);
}

console.log("✅ MongoDB URI loaded");

/***********************
 * 6. DB CONNECTION
 ***********************/
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

/***********************
 * 7. HEALTH + DEBUG
 ***********************/
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Debug route (REMOVE after testing)
app.get("/debug/db", async (req, res) => {
  try {
    const users = await User.countDocuments();
    res.json({ dbConnected: true, users });
  } catch (err) {
    res.status(500).json({ dbConnected: false, error: err.message });
  }
});

/***********************
 * 8. AUTH ROUTES
 ***********************/

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "This email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password, // plain text (OK for demo/learning)
      role: "user",
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ email });
    console.log("USER FROM DB:", user);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Password mismatch" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 LOGIN ERROR STACK:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});


/***********************
 * 9. REGISTRATION ROUTES
 ***********************/

// CREATE / UPDATE REGISTRATION (one per user)
app.post("/api/registrations", async (req, res) => {
  try {
    const { userId, name, email, age, qualification } = req.body;

    if (!userId || !name || !email || !age || !qualification) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let registration = await Registration.findOne({ userId });

    if (!registration) {
      registration = await Registration.create({
        userId,
        name,
        email,
        age,
        qualification,
        status: "pending",
      });
    } else {
      registration.set({
        name,
        email,
        age,
        qualification,
        status: "pending",
      });
      await registration.save();
    }

    res.json({
      registration,
      amount_cents: 49900,
      currency: "INR",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET REGISTRATION BY USER
app.get("/api/registrations/by-user/:userId", async (req, res) => {
  try {
    const registration = await Registration.findOne({
      userId: req.params.userId,
    });

    if (!registration) {
      return res.status(404).json({ error: "No registration found" });
    }

    res.json({ registration });
  } catch (err) {
    console.error("Fetch registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// MARK PAID (Mock Payment)
app.post("/api/registrations/:id/mark-paid", async (req, res) => {
  try {
    await Registration.findByIdAndUpdate(req.params.id, {
      status: "paid",
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Mark paid error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/***********************
 * 10. ADMIN ROUTE
 ***********************/
app.get("/api/admin/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({
      createdAt: -1,
    });
    res.json({ registrations });
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/***********************
 * 11. START SERVER
 ***********************/
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

