
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


// Added for  email OTP

const nodemailer = require("nodemailer");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const blockedEmailDomains = [
  "abc.com",
  "test.com",
  "example.com",
  "mail.com",
  "email.com",
  "fake.com",
  "dummy.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "guerrillamail.com"
];

function isValidBusinessEmail(email) {
  if (!email || !email.includes("@")) return false;

  const domain = email.split("@")[1].toLowerCase();
  return !blockedEmailDomains.includes(domain);
}

// Added this code for check email is right or wrong before OTP validation

const dns = require("dns").promises;

async function hasValidMailServer(email) {
  try {
    const domain = email.split("@")[1];
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    return false;
  }
}


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

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});




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

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    if (!isValidBusinessEmail(email)) {
      return res.status(400).json({
        error: "Invalid Email Address",
      });
    }

    // ✅ Check if email domain can actually receive emails
        const isEmailDeliverable = await hasValidMailServer(email);

        if (!isEmailDeliverable) {
          return res.status(400).json({
            error: "Email address does not exist or cannot receive emails",
          });
        }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "This email is already registered",
      });
    }

    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
      emailOtp: otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      emailVerified: false,
    });


    await transporter.sendMail({
      from: `"Registration App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <h3>Email Verification</h3>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });



    res.status(201).json({
      message: "OTP sent to your email",
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add OTP Verification API

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    if (user.emailOtp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.emailVerified = true;
    user.emailOtp = null;
    user.otpExpiresAt = null;
    await user.save();

    // ✅ RETURN USER DATA
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// for verification I have added not imp

app.get("/debug/send-test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "Email system working",
    });
    res.send("Test email sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email failed");
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

// abhove commented dur to req change in field




// app.post("/api/registrations", async (req, res) => {
//   try {
//     const { userId, name, email } = req.body;

//     if (!userId || !name || !email) {
//       return res.status(400).json({ error: "Required fields missing" });
//     }

//     let registration = await Registration.findOne({ userId });

//     if (!registration) {
//       registration = await Registration.create({
//         userId,
//         ...req.body, // 🔥 ACCEPT ALL FORM FIELDS
//         status: "pending",
//       });
//     } else {
//       registration.set({
//         ...req.body,
//         status: "pending",
//       });
//       await registration.save();
//     }

//     res.json({
//       registration,
//       amount_cents: 49900,
//       currency: "INR",
//     });
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



app.post("/api/registrations", async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      age,
      qualification,
      birthPlaceTime,
      profession,
      complexion,
      gotra,
      height,
      caste,
      religion,
      professionalProfile,
      grandfatherName,
      fatherName,
      motherName,
      maternalFamily,
      mobile,
      address,
    } = req.body;

    if (!userId || !name || !email) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const payload = {
      userId,
      name,
      email,
      age,
      qualification,
      birthPlaceTime,
      profession,
      complexion,
      gotra,
      height,
      caste,
      religion,
      professionalProfile,
      grandfatherName,
      fatherName,
      motherName,
      maternalFamily,
      mobile,
      address,
      status: "pending",
    };

    let registration = await Registration.findOne({ userId });

    if (!registration) {
      registration = await Registration.create(payload);
    } else {
      registration.set(payload);
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

