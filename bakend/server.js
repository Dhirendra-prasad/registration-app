// // /**
// //  * Express backend (single-file) with endpoints to match the React frontend.
// //  * Supports both Stripe Checkout flow and Razorpay Orders flow (India).
// //  *
// //  * Save as: server.js
// //  * Run: npm init -y && npm install express body-parser dotenv stripe axios crypto pg cors
// //  * (If you don't need PostgreSQL, you can replace storage with an in-memory map for testing.)
// //  *
// //  * Environment variables (create a .env file):
// //  *   PORT=4242
// //  *   DATABASE_URL=postgres://user:pass@localhost:5432/dbname    # optional
// //  *   STRIPE_SECRET_KEY=sk_test_...
// //  *   STRIPE_WEBHOOK_SECRET=whsec_...
// //  *   RAZORPAY_KEY_ID=rzp_test_...
// //  *   RAZORPAY_KEY_SECRET=...
// //  *
// //  * This file demonstrates:
// //  *  - POST /api/registrations       -> create registration (stores in DB or in-memory)
// //  *  - POST /api/stripe/create-checkout-session -> create Stripe Checkout session
// //  *  - POST /api/razorpay/create-order         -> create Razorpay order (returns order id & payment info)
// //  *  - POST /api/webhooks/stripe                -> Stripe webhook handler
// //  *  - POST /api/webhooks/razorpay               -> Razorpay webhook handler (signature verification)
// //  *
// //  * Notes:
// //  *  - For production use, move DB code to separate module, add authentication & better error handling.
// //  *  - Save gateway payloads for audit. Use idempotency when handling webhooks.
// //  */

// // require('dotenv').config();
// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const crypto = require('crypto');
// // const cors = require('cors');

// // const app = express();
// // const PORT = process.env.PORT || 4242;

// // // Use JSON parsing for normal routes, but raw body for Stripe webhook verification
// // app.use(cors());
// // app.use(express.json());

// // // --------- Simple in-memory storage (replace with DB) ---------
// // const registrations = new Map(); // registrationId -> { id, name, email, age, qualification, status, createdAt }
// // const payments = new Map();
// // // const { v4: uuidv4 } = require('uuid');
// // const uuidv4 = require('uuid4');

// // // --------- Stripe setup ---------
// // let stripe = null;
// // if (process.env.STRIPE_SECRET_KEY) {
// //   stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// // }
// // const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// // // --------- Razorpay setup ---------
// // const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
// // const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
// // const axios = require('axios');

// // // ------------------ Helpers ------------------
// // function createRegistration(data) {
// //   const id = uuidv4();
// //   const rec = {
// //     id,
// //     name: data.name,
// //     email: data.email,
// //     age: data.age,
// //     qualification: data.qualification,
// //     status: 'pending', // pending | paid | failed
// //     createdAt: new Date().toISOString(),
// //   };
// //   registrations.set(id, rec);
// //   return rec;
// // }

// // // ------------------ Routes ------------------
// // // POST /api/registrations
// // app.post('/api/registrations', (req, res) => {
// //   const { name, email, age, qualification } = req.body;
// //   if (!name || !email || !age || !qualification) {
// //     return res.status(400).json({ error: 'Missing required fields' });
// //   }

// //   // Create registration
// //   const reg = createRegistration({ name, email, age, qualification });

// //   // In a real app, you'd insert into DB and return the DB id and possibly an amount to pay
// //   return res.json({ registration: reg, amount_cents: 49900, currency: 'INR' });
// // });

// // // ===== Stripe: create checkout session =====
// // app.post('/api/stripe/create-checkout-session', async (req, res) => {
// //   if (!stripe) return res.status(500).json({ error: 'Stripe not configured on server' });

// //   const { registrationId, amount_cents, currency } = req.body;
// //   if (!registrationId || !registrations.has(registrationId)) return res.status(400).json({ error: 'Invalid registrationId' });

// //   const registration = registrations.get(registrationId);

// //   try {
// //     // Create a checkout session
// //     const session = await stripe.checkout.sessions.create({
// //       payment_method_types: ['card'],
// //       line_items: [
// //         {
// //           price_data: {
// //             currency: currency || 'inr',
// //             product_data: { name: 'Registration Fee' },
// //             unit_amount: amount_cents || 49900,
// //           },
// //           quantity: 1,
// //         },
// //       ],
// //       mode: 'payment',
// //       // Pass registration id in metadata so we can map in the webhook
// //       metadata: { registrationId: registration.id },
// //       success_url: 'http://localhost:3000/?payment=success',
// //       cancel_url: 'http://localhost:3000/?payment=cancel',
// //     });

// //     return res.json({ url: session.url, id: session.id });
// //   } catch (err) {
// //     console.error('Stripe create session failed', err);
// //     return res.status(500).json({ error: 'Stripe session creation failed' });
// //   }
// // });

// // // ===== Stripe webhook =====
// // // For stripe, we need raw body to validate signature
// // app.post('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), (req, res) => {
// //   if (!stripe) return res.status(500).send('Stripe not configured');

// //   const sig = req.headers['stripe-signature'];
// //   let event;

// //   try {
// //     event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
// //   } catch (err) {
// //     console.error('Stripe webhook signature verification failed:', err.message);
// //     return res.status(400).send(`Webhook Error: ${err.message}`);
// //   }

// //   // Handle the checkout.session.completed event
// //   if (event.type === 'checkout.session.completed') {
// //     const session = event.data.object;
// //     const registrationId = session.metadata && session.metadata.registrationId;
// //     console.log('Stripe checkout completed for registration', registrationId);

// //     // Mark registration paid
// //     if (registrationId && registrations.has(registrationId)) {
// //       const r = registrations.get(registrationId);
// //       r.status = 'paid';
// //       registrations.set(registrationId, r);

// //       // Save payment record
// //       const payId = uuidv4();
// //       payments.set(payId, {
// //         id: payId,
// //         registrationId,
// //         gateway: 'stripe',
// //         gatewayPaymentId: session.payment_intent || session.payment, // depending on payload
// //         amount_cents: session.amount_total || null,
// //         currency: session.currency || null,
// //         status: 'succeeded',
// //         raw: session,
// //         createdAt: new Date().toISOString(),
// //       });
// //     }
// //   }

// //   // Return 200 to acknowledge receipt of the event
// //   res.json({ received: true });
// // });

// // // ===== Razorpay: create order =====
// // // Razorpay typical flow: create order on server, send order id to client, client opens checkout with key_id + order_id, then server verifies signature on webhook or on payment success response
// // app.post('/api/razorpay/create-order', async (req, res) => {
// //   const { registrationId, amount_cents, currency } = req.body;
// //   if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return res.status(500).json({ error: 'Razorpay not configured' });
// //   if (!registrationId || !registrations.has(registrationId)) return res.status(400).json({ error: 'Invalid registrationId' });

// //   const registration = registrations.get(registrationId);

// //   try {
// //     // Razorpay expects amount in paise for INR
// //     const amount = amount_cents || 49900; // e.g., ₹499.00 -> 49900 paise

// //     // Create order via Razorpay Orders API (server-to-server)
// //     const resp = await axios.post(
// //       'https://api.razorpay.com/v1/orders',
// //       { amount, currency: currency || 'INR', receipt: `reg_${registrationId}`, payment_capture: 1 },
// //       {
// //         auth: { username: RAZORPAY_KEY_ID, password: RAZORPAY_KEY_SECRET },
// //       }
// //     );

// //     // Save order id in memory for later verification
// //     const order = resp.data; // includes id, amount, currency
// //     payments.set(order.id, { id: order.id, registrationId, gateway: 'razorpay', status: 'created', raw: order, createdAt: new Date().toISOString() });

// //     return res.json({ order });
// //   } catch (err) {
// //     console.error('Razorpay create order failed', err && err.response && err.response.data ? err.response.data : err.message);
// //     return res.status(500).json({ error: 'Razorpay order creation failed' });
// //   }
// // });

// // // ===== Razorpay webhook endpoint =====
// // // Razorpay signs payload with header 'x-razorpay-signature' using your webhook secret (set in Razorpay dashboard)
// // app.post('/api/webhooks/razorpay', express.json(), (req, res) => {
// //   const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
// //   const signature = req.headers['x-razorpay-signature'];
// //   const body = JSON.stringify(req.body);

// //   if (!webhookSecret) {
// //     console.warn('No RAZORPAY_WEBHOOK_SECRET configured - cannot verify signature');
// //   } else {
// //     const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
// //     if (expected !== signature) {
// //       console.error('Razorpay signature mismatch');
// //       return res.status(400).send('invalid signature');
// //     }
// //   }

// //   const event = req.body;
// //   // Example: payment.captured or payment.authorized events
// //   if (event.event === 'payment.captured') {
// //     const paymentEntity = event.payload && event.payload.payment && event.payload.payment.entity;
// //     if (paymentEntity) {
// //       const razorpayOrderId = paymentEntity.order_id; // maps to the order we created
// //       console.log('Razorpay payment captured for order:', razorpayOrderId);

// //       const paymentRecord = payments.get(razorpayOrderId);
// //       if (paymentRecord) {
// //         paymentRecord.status = 'succeeded';
// //         paymentRecord.raw = paymentEntity;
// //         payments.set(razorpayOrderId, paymentRecord);

// //         // Mark registration as paid
// //         const regId = paymentRecord.registrationId;
// //         if (regId && registrations.has(regId)) {
// //           const r = registrations.get(regId);
// //           r.status = 'paid';
// //           registrations.set(regId, r);
// //         }
// //       }
// //     }
// //   }

// //   res.json({ received: true });
// // });

// // // Simple admin route to view registrations (no auth in this demo)
// // app.get('/api/admin/registrations', (req, res) => {
// //   const arr = Array.from(registrations.values());
// //   res.json({ registrations: arr });
// // });

// // // Get single registration
// // app.get('/api/registrations/:id', (req, res) => {
// //   const id = req.params.id;
// //   if (!registrations.has(id)) return res.status(404).json({ error: 'Not found' });
// //   return res.json({ registration: registrations.get(id) });
// // });

// // app.listen(PORT, () => {
// //   console.log(`Server listening on http://localhost:${PORT}`);
// // });






// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const crypto = require('crypto');
// const cors = require('cors');
// const axios = require('axios');
// const Database = require('better-sqlite3');

// const app = express();
// const PORT = process.env.PORT || 4242;

// // -------- DB SETUP (SQLite file: app.db) --------
// const db = new Database('app.db');

// // Create tables if not exist
// db.exec(`
//   CREATE TABLE IF NOT EXISTS registrations (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT NOT NULL,
//     age INTEGER NOT NULL,
//     qualification TEXT NOT NULL,
//     status TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | failed
//     created_at TEXT NOT NULL
//   );

//   CREATE TABLE IF NOT EXISTS payments (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     registration_id INTEGER,
//     gateway TEXT,
//     gateway_payment_id TEXT,
//     amount_cents INTEGER,
//     currency TEXT,
//     status TEXT,
//     raw_json TEXT,
//     created_at TEXT NOT NULL,
//     FOREIGN KEY (registration_id) REFERENCES registrations(id)
//   );
// `);

// // Helper functions
// function createRegistration({ name, email, age, qualification }) {
//   const stmt = db.prepare(`
//     INSERT INTO registrations (name, email, age, qualification, status, created_at)
//     VALUES (?, ?, ?, ?, 'pending', ?)
//   `);
//   const info = stmt.run(name, email, age, qualification, new Date().toISOString());
//   return getRegistrationById(info.lastInsertRowid);
// }

// function getRegistrationById(id) {
//   return db.prepare(`SELECT * FROM registrations WHERE id = ?`).get(id);
// }

// function updateRegistrationStatus(id, status) {
//   db.prepare(`UPDATE registrations SET status = ? WHERE id = ?`).run(status, id);
// }

// function getAllRegistrations() {
//   return db.prepare(`SELECT * FROM registrations ORDER BY created_at DESC`).all();
// }

// function savePayment({ registrationId, gateway, gatewayPaymentId, amount_cents, currency, status, raw }) {
//   db.prepare(`
//     INSERT INTO payments (registration_id, gateway, gateway_payment_id, amount_cents, currency, status, raw_json, created_at)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `).run(
//     registrationId,
//     gateway,
//     gatewayPaymentId,
//     amount_cents || null,
//     currency || null,
//     status,
//     JSON.stringify(raw || {}),
//     new Date().toISOString()
//   );
// }

// // ------------ Middlewares ------------
// app.use(cors());
// app.use(express.json());

// // NOTE: Stripe webhook needs raw body, so we’ll define that route separately below

// // --------- Stripe setup (optional) ----------
// let stripe = null;
// if (process.env.STRIPE_SECRET_KEY) {
//   stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// }
// const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// // --------- Razorpay setup (optional) ----------
// const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
// const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
// const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// // ------------------ ROUTES ------------------

// // Create registration (called by frontend form)
// app.post('/api/registrations', (req, res) => {
//   const { name, email, age, qualification } = req.body;

//   if (!name || !email || !age || !qualification) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const registration = createRegistration({
//     name,
//     email,
//     age: Number(age),
//     qualification,
//   });

//   // For now we fix amount to ₹499 = 49900 paise
//   return res.json({
//     registration,
//     amount_cents: 49900,
//     currency: 'INR',
//   });
// });

// // ===== Stripe: create checkout session =====
// app.post('/api/stripe/create-checkout-session', async (req, res) => {
//   if (!stripe) return res.status(500).json({ error: 'Stripe not configured on server' });

//   const { registrationId, amount_cents, currency } = req.body;
//   const registration = getRegistrationById(registrationId);

//   if (!registration) {
//     return res.status(400).json({ error: 'Invalid registrationId' });
//   }

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: currency || 'inr',
//             product_data: { name: 'Registration Fee' },
//             unit_amount: amount_cents || 49900,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       metadata: { registrationId: registration.id.toString() },
//       success_url: 'http://localhost:3000/?payment=success',
//       cancel_url: 'http://localhost:3000/?payment=cancel',
//     });

//     return res.json({ url: session.url, id: session.id });
//   } catch (err) {
//     console.error('Stripe create session failed', err);
//     return res.status(500).json({ error: 'Stripe session creation failed' });
//   }
// });

// // ===== Razorpay: create order =====
// app.post('/api/razorpay/create-order', async (req, res) => {
//   const { registrationId, amount_cents, currency } = req.body;

//   if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
//     return res.status(500).json({ error: 'Razorpay not configured' });
//   }

//   const registration = getRegistrationById(registrationId);
//   if (!registration) {
//     return res.status(400).json({ error: 'Invalid registrationId' });
//   }

//   try {
//     const amount = amount_cents || 49900; // in paise

//     const resp = await axios.post(
//       'https://api.razorpay.com/v1/orders',
//       {
//         amount,
//         currency: currency || 'INR',
//         receipt: `reg_${registrationId}`,
//         payment_capture: 1,
//       },
//       {
//         auth: {
//           username: RAZORPAY_KEY_ID,
//           password: RAZORPAY_KEY_SECRET,
//         },
//       }
//     );

//     const order = resp.data;

//     // we will store payment later when webhook comes
//     return res.json({ order });
//   } catch (err) {
//     console.error(
//       'Razorpay create order failed',
//       err && err.response && err.response.data ? err.response.data : err.message
//     );
//     return res.status(500).json({ error: 'Razorpay order creation failed' });
//   }
// });

// // ===== Stripe webhook (raw body) =====
// app.post(
//   '/api/webhooks/stripe',
//   bodyParser.raw({ type: 'application/json' }),
//   (req, res) => {
//     if (!stripe) return res.status(500).send('Stripe not configured');

//     const sig = req.headers['stripe-signature'];

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
//     } catch (err) {
//       console.error('Stripe webhook signature verification failed:', err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
//       const registrationId = session.metadata && session.metadata.registrationId;

//       console.log('Stripe checkout completed for registration', registrationId);

//       if (registrationId) {
//         updateRegistrationStatus(registrationId, 'paid');

//         savePayment({
//           registrationId: Number(registrationId),
//           gateway: 'stripe',
//           gatewayPaymentId: session.payment_intent || session.payment,
//           amount_cents: session.amount_total || null,
//           currency: session.currency || null,
//           status: 'succeeded',
//           raw: session,
//         });
//       }
//     }

//     res.json({ received: true });
//   }
// );

// // ===== Razorpay webhook =====
// app.post('/api/webhooks/razorpay', express.json(), (req, res) => {
//   const signature = req.headers['x-razorpay-signature'];
//   const body = JSON.stringify(req.body);

//   if (RAZORPAY_WEBHOOK_SECRET) {
//     const expected = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');
//     if (expected !== signature) {
//       console.error('Razorpay signature mismatch');
//       return res.status(400).send('invalid signature');
//     }
//   } else {
//     console.warn('No RAZORPAY_WEBHOOK_SECRET configured - skipping signature check');
//   }

//   const event = req.body;

//   if (event.event === 'payment.captured') {
//     const paymentEntity = event.payload && event.payload.payment && event.payload.payment.entity;
//     if (paymentEntity) {
//       const razorpayOrderId = paymentEntity.order_id;
//       const registrationIdRaw = (paymentEntity.notes && paymentEntity.notes.registrationId) || null;

//       console.log('Razorpay payment captured for order:', razorpayOrderId);

//       // If you saved registrationId in notes when creating order, you can use it here
//       if (registrationIdRaw) {
//         updateRegistrationStatus(registrationIdRaw, 'paid');

//         savePayment({
//           registrationId: Number(registrationIdRaw),
//           gateway: 'razorpay',
//           gatewayPaymentId: paymentEntity.id,
//           amount_cents: paymentEntity.amount,
//           currency: paymentEntity.currency,
//           status: 'succeeded',
//           raw: paymentEntity,
//         });
//       }
//     }
//   }

//   res.json({ received: true });
// });

// // Simple admin route to view registrations (no auth yet)
// app.get('/api/admin/registrations', (req, res) => {
//   const rows = getAllRegistrations();
//   res.json({ registrations: rows });
// });

// // Get single registration
// app.get('/api/registrations/:id', (req, res) => {
//   const id = req.params.id;
//   const reg = getRegistrationById(id);
//   if (!reg) return res.status(404).json({ error: 'Not found' });
//   return res.json({ registration: reg });
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });








// server.js — Backend with MySQL + Razorpay + filters + CSV

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 4242;

// ===== 1. MySQL pool =====
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "registration_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper DB functions
async function createRegistration({ name, email, age, qualification }) {
  const sql = `
    INSERT INTO registrations (name, email, age, qualification, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', NOW())
  `;
  const [result] = await pool.execute(sql, [
    name,
    email,
    age,
    qualification,
  ]);
  return getRegistrationById(result.insertId);
}

async function getRegistrationById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM registrations WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function updateRegistrationStatus(id, status) {
  await pool.execute("UPDATE registrations SET status = ? WHERE id = ?", [
    status,
    id,
  ]);
}

async function savePayment({
  registrationId,
  gateway,
  gatewayPaymentId,
  amount_cents,
  currency,
  status,
  raw,
}) {
  const sql = `
    INSERT INTO payments
      (registration_id, gateway, gateway_payment_id, amount_cents, currency, status, raw_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  await pool.execute(sql, [
    registrationId,
    gateway,
    gatewayPaymentId,
    amount_cents || null,
    currency || null,
    status,
    JSON.stringify(raw || {}),
  ]);
}

async function getRegistrationsFiltered({ status, from, to }) {
  let sql = "SELECT * FROM registrations WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (from) {
    sql += " AND created_at >= ?";
    params.push(from);
  }
  if (to) {
    sql += " AND created_at <= ?";
    params.push(to + " 23:59:59");
  }

  sql += " ORDER BY created_at DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ===== 2. Middleware =====
app.use(cors());
app.use(express.json());

// ===== 3. Razorpay env =====
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

// ===== 4. Routes =====


// ===== Auth: user signup =====
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }

    // check if email already exists
    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const sql = `
      INSERT INTO users (name, email, password, role, created_at)
      VALUES (?, ?, ?, 'user', NOW())
    `;
    const [result] = await pool.execute(sql, [name, email, password]);

    const user = {
      id: result.insertId,
      name,
      email,
      role: "user",
    };

    res.json({ user });
  } catch (err) {
    console.error("Error in /api/auth/register:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Auth: login (user or admin) =====
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // Simple plain-text comparison for now (not secure, OK for local learning)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Don't send password back
    delete user.password;

    res.json({ user });
  } catch (err) {
    console.error("Error in /api/auth/login:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// 4.1 Create registration
app.post("/api/registrations", async (req, res) => {
  try {
    const { name, email, age, qualification } = req.body;

    if (!name || !email || !age || !qualification) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const registration = await createRegistration({
      name,
      email,
      age: Number(age),
      qualification,
    });

    res.json({
      registration,
      amount_cents: 49900,
      currency: "INR",
    });
  } catch (err) {
    console.error("Error in /api/registrations:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4.2 Create Razorpay order
app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    const { registrationId, amount_cents, currency } = req.body;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay not configured" });
    }

    const registration = await getRegistrationById(registrationId);
    if (!registration) {
      return res.status(400).json({ error: "Invalid registrationId" });
    }

    const amount = amount_cents || 49900;

    const resp = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount,
        currency: currency || "INR",
        receipt: `reg_${registrationId}`,
        payment_capture: 1,
        notes: {
          registrationId: String(registrationId),
        },
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    const order = resp.data;
    res.json({ order });
  } catch (err) {
    console.error(
      "Razorpay create order failed:",
      err?.response?.data || err.message
    );
    res.status(500).json({ error: "Razorpay order creation failed" });
  }
});

// 4.3 Mark registration as paid
app.post("/api/registrations/:id/mark-paid", async (req, res) => {
  try {
    const id = req.params.id;
    const registration = await getRegistrationById(id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    await updateRegistrationStatus(id, "paid");
    await savePayment({
      registrationId: Number(id),
      gateway: "razorpay-manual",
      gatewayPaymentId: null,
      amount_cents: 49900,
      currency: "INR",
      status: "succeeded",
      raw: { manual: true },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error in mark-paid:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4.4 Get one registration
app.get("/api/registrations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const reg = await getRegistrationById(id);
    if (!reg) return res.status(404).json({ error: "Not found" });
    res.json({ registration: reg });
  } catch (err) {
    console.error("Error in GET /api/registrations/:id", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4.5 Admin list with filters
app.get("/api/admin/registrations", async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const rows = await getRegistrationsFiltered({ status, from, to });
    res.json({ registrations: rows });
  } catch (err) {
    console.error("Error in /api/admin/registrations:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4.6 CSV export
app.get("/api/admin/registrations/export", async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const rows = await getRegistrationsFiltered({ status, from, to });

    const header = [
      "id",
      "name",
      "email",
      "age",
      "qualification",
      "status",
      "created_at",
    ];

    function escapeCsv(value) {
      if (value == null) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.id,
          r.name,
          r.email,
          r.age,
          r.qualification,
          r.status,
          r.created_at,
        ]
          .map(escapeCsv)
          .join(",")
      );
    }

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="registrations.csv"'
    );
    res.send(csv);
  } catch (err) {
    console.error("Error in CSV export:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
