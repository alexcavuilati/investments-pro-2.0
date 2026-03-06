import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("investments_pro.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-investment-pro-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    tier TEXT DEFAULT 'STANDARD',
    kyc_status TEXT DEFAULT 'PENDING',
    proof_of_funds_usd REAL DEFAULT 0,
    entity_type TEXT DEFAULT 'Individual',
    country_of_origin TEXT DEFAULT 'AU',
    bio TEXT,
    avatar_url TEXT,
    phone TEXT,
    trial_ends_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Add password column if it doesn't exist (for existing databases)
  PRAGMA table_info(users);
`);

// Check and add missing columns to posts table
const postCols = db.prepare("PRAGMA table_info(posts)").all() as any[];
if (!postCols.find(col => col.name === 'type')) {
  db.exec("ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'NORMAL';");
}
if (!postCols.find(col => col.name === 'country')) {
  db.exec("ALTER TABLE posts ADD COLUMN country TEXT;");
}
if (!postCols.find(col => col.name === 'city')) {
  db.exec("ALTER TABLE posts ADD COLUMN city TEXT;");
}
if (!postCols.find(col => col.name === 'price')) {
  db.exec("ALTER TABLE posts ADD COLUMN price REAL;");
}
if (!postCols.find(col => col.name === 'rent')) {
  db.exec("ALTER TABLE posts ADD COLUMN rent REAL;");
}
if (!postCols.find(col => col.name === 'analysis_results')) {
  db.exec("ALTER TABLE posts ADD COLUMN analysis_results TEXT;");
}

// Check and add missing columns to users table
const userCols = db.prepare("PRAGMA table_info(users)").all() as any[];
if (!userCols.find(col => col.name === 'password')) {
  db.exec("ALTER TABLE users ADD COLUMN password TEXT;");
}
if (!userCols.find(col => col.name === 'bio')) {
  db.exec("ALTER TABLE users ADD COLUMN bio TEXT;");
}
if (!userCols.find(col => col.name === 'avatar_url')) {
  db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
}
if (!userCols.find(col => col.name === 'phone')) {
  db.exec("ALTER TABLE users ADD COLUMN phone TEXT;");
}
if (!userCols.find(col => col.name === 'trial_ends_at')) {
  db.exec("ALTER TABLE users ADD COLUMN trial_ends_at DATETIME;");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    friend_id INTEGER,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    project_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS kyc_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    file_name TEXT,
    file_path TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    country TEXT,
    state_province TEXT,
    city_district TEXT,
    purchase_price REAL,
    fiscal_variables TEXT,
    projected_roi REAL,
    irr REAL,
    npv_estimate REAL,
    loan_readiness_score INTEGER,
    eoi_ready INTEGER DEFAULT 0,
    jurisdiction_laws TEXT,
    risk_assessment TEXT,
    climate_risk TEXT,
    iot_twin TEXT,
    liquidity TEXT,
    deal_hunter TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS deal_hunter_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    is_active INTEGER DEFAULT 0,
    discount_threshold REAL,
    max_bid_usd REAL,
    auto_eoi_drafting INTEGER DEFAULT 0,
    strategy_notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    country TEXT,
    category TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    type TEXT DEFAULT 'NORMAL',
    country TEXT,
    city TEXT,
    price REAL,
    rent REAL,
    analysis_results TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id INTEGER PRIMARY KEY,
    email_alerts INTEGER DEFAULT 1,
    push_notifications INTEGER DEFAULT 1,
    market_updates INTEGER DEFAULT 1,
    deal_alerts INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Middleware for authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// Seed some news if empty
const newsCount = db.prepare("SELECT COUNT(*) as count FROM news").get() as { count: number };
if (newsCount.count === 0) {
  const insertNews = db.prepare("INSERT INTO news (title, content, country, category) VALUES (?, ?, ?, ?)");
  insertNews.run("Fiji SLIP Tax Update 2026", "New amendments to the Short Life Investment Package (SLIP) provide 10-year tax holidays for hotel developments over $7M FJD.", "Fiji", "Tax");
  insertNews.run("Australia FIRB Thresholds Adjusted", "Foreign Investment Review Board (FIRB) has increased thresholds for commercial real estate acquisitions in Sydney and Melbourne.", "Australia", "Legal");
  insertNews.run("UAE Golden Visa Expansion", "Dubai announces new pathways for property investors to secure 10-year residency with reduced minimum investment requirements.", "UAE", "Legal");
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cors());

  // Activity Logs
  const logActivity = (userId: number, action: string, details: string) => {
    db.prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)")
      .run(userId, action, details);
  };

  app.get("/api/activity", authenticateToken, (req: any, res) => {
    const logs = db.prepare("SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20")
      .all(req.user.id);
    res.json(logs);
  });

  // Posts / Home Feed
  app.get("/api/posts", authenticateToken, (req, res) => {
    const posts = db.prepare(`
      SELECT p.*, u.name as user_name, u.avatar_url 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `).all();
    res.json(posts);
  });

  app.post("/api/posts", authenticateToken, (req: any, res: any) => {
    const { content, image_url, type, country, city, price, rent } = req.body;
    db.prepare("INSERT INTO posts (user_id, content, image_url, type, country, city, price, rent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(req.user.id, content, image_url, type || 'NORMAL', country, city, price, rent);
    logActivity(req.user.id, "POST_CREATED", `Created a new ${type || 'NORMAL'} post on the home feed`);
    res.json({ success: true });
  });

  app.post("/api/posts/:id/analysis", authenticateToken, async (req: any, res: any) => {
    const { id } = req.params;
    const { analysis } = req.body;
    try {
      db.prepare("UPDATE posts SET analysis_results = ? WHERE id = ?").run(JSON.stringify(analysis), id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notification Preferences
  app.get("/api/notifications/settings", authenticateToken, (req: any, res) => {
    let settings = db.prepare("SELECT * FROM notification_preferences WHERE user_id = ?").get(req.user.id);
    if (!settings) {
      db.prepare("INSERT INTO notification_preferences (user_id) VALUES (?)").run(req.user.id);
      settings = db.prepare("SELECT * FROM notification_preferences WHERE user_id = ?").get(req.user.id);
    }
    res.json(settings);
  });

  app.put("/api/notifications/settings", authenticateToken, (req: any, res) => {
    const { email_alerts, push_notifications, market_updates, deal_alerts } = req.body;
    db.prepare(`
      UPDATE notification_preferences 
      SET email_alerts = ?, push_notifications = ?, market_updates = ?, deal_alerts = ? 
      WHERE user_id = ?
    `).run(email_alerts ? 1 : 0, push_notifications ? 1 : 0, market_updates ? 1 : 0, deal_alerts ? 1 : 0, req.user.id);
    res.json({ success: true });
  });

  // Profile Update
  app.put("/api/user/profile", authenticateToken, (req: any, res) => {
    const { name, bio, phone, avatar_url } = req.body;
    db.prepare("UPDATE users SET name = ?, bio = ?, phone = ?, avatar_url = ? WHERE id = ?")
      .run(name, bio, phone, avatar_url, req.user.id);
    logActivity(req.user.id, "PROFILE_UPDATED", "Updated profile information");
    res.json({ success: true });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Set trial to 3 days from now
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3);

      const result = db.prepare("INSERT INTO users (email, password, name, trial_ends_at) VALUES (?, ?, ?, ?)")
        .run(email, hashedPassword, name, trialEndsAt.toISOString());

      const user = { id: result.lastInsertRowid, email, name, trial_ends_at: trialEndsAt.toISOString() };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, email, name, tier, kyc_status, proof_of_funds_usd, entity_type, country_of_origin, bio, phone, avatar_url, trial_ends_at FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  // WebSocket Logic
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on("send_message", (data) => {
      const { sender_id, receiver_id, content } = data;
      db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(
        sender_id, receiver_id, content
      );
      io.to(`user_${receiver_id}`).emit("new_message", data);
      io.to(`user_${sender_id}`).emit("new_message", data);
    });

    socket.on("typing", (data) => {
      io.to(`user_${data.receiver_id}`).emit("user_typing", { sender_id: data.sender_id });
    });
  });

  // API Routes
  app.post("/api/feedback", authenticateToken, (req: any, res) => {
    try {
      const { project_id, rating, comment } = req.body;
      db.prepare("INSERT INTO feedback (user_id, project_id, rating, comment) VALUES (?, ?, ?, ?)")
        .run(req.user.id, project_id, rating, comment);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare("SELECT id, email, name, tier, kyc_status, proof_of_funds_usd, entity_type, country_of_origin, bio, phone, avatar_url FROM users WHERE id = ?").get(req.user.id);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users", authenticateToken, (req, res) => {
    const users = db.prepare("SELECT id, name, email, kyc_status FROM users").all();
    res.json(users);
  });

  app.get("/api/friends", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const friends = db.prepare(`
      SELECT u.id, u.name, u.email, f.status 
      FROM users u 
      JOIN friends f ON (u.id = f.friend_id OR u.id = f.user_id)
      WHERE (f.user_id = ? OR f.friend_id = ?) AND u.id != ?
    `).all(userId, userId, userId);
    res.json(friends);
  });

  app.post("/api/friends", authenticateToken, (req: any, res) => {
    const { friend_id } = req.body;
    db.prepare("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'ACCEPTED')").run(req.user.id, friend_id);
    res.json({ success: true });
  });

  app.get("/api/messages/:friendId", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { friendId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, friendId, friendId, userId);
    res.json(messages);
  });

  app.get("/api/news", (req, res) => {
    try {
      const news = db.prepare("SELECT * FROM news ORDER BY published_at DESC").all();
      res.json(news);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects", authenticateToken, (req: any, res) => {
    try {
      const projects = db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id).map((p: any) => ({
        ...p,
        fiscal_variables: p.fiscal_variables ? JSON.parse(p.fiscal_variables) : null,
        eoi_ready: !!p.eoi_ready,
        npv_estimate: p.npv_estimate,
        jurisdiction_laws: p.jurisdiction_laws ? JSON.parse(p.jurisdiction_laws) : null,
        risk_assessment: p.risk_assessment ? JSON.parse(p.risk_assessment) : null,
        climate_risk: p.climate_risk ? JSON.parse(p.climate_risk) : null,
        iot_twin: p.iot_twin ? JSON.parse(p.iot_twin) : null,
        liquidity: p.liquidity ? JSON.parse(p.liquidity) : null,
        deal_hunter: p.deal_hunter ? JSON.parse(p.deal_hunter) : null
      }));
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects", authenticateToken, (req: any, res) => {
    try {
      const {
        name, country, state_province, city_district,
        purchase_price, fiscal_variables,
        projected_roi, irr, npv_estimate, loan_readiness_score, eoi_ready,
        jurisdiction_laws, risk_assessment, climate_risk, iot_twin, liquidity, deal_hunter
      } = req.body;

      const result = db.prepare(`
        INSERT INTO projects (
          user_id, name, country, state_province, city_district, 
          purchase_price, fiscal_variables,
          projected_roi, irr, npv_estimate, loan_readiness_score, eoi_ready, 
          jurisdiction_laws, risk_assessment, climate_risk, iot_twin, liquidity, deal_hunter
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, name, country, state_province, city_district,
        purchase_price, JSON.stringify(fiscal_variables),
        projected_roi, irr, npv_estimate, loan_readiness_score, eoi_ready ? 1 : 0,
        jurisdiction_laws ? JSON.stringify(jurisdiction_laws) : null,
        risk_assessment ? JSON.stringify(risk_assessment) : null,
        climate_risk ? JSON.stringify(climate_risk) : null,
        iot_twin ? JSON.stringify(iot_twin) : null,
        liquidity ? JSON.stringify(liquidity) : null,
        deal_hunter ? JSON.stringify(deal_hunter) : null
      );
      logActivity(req.user.id, "PROJECT_SAVED", `Saved a new investment project: ${name}`);
      res.json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/kyc", authenticateToken, (req: any, res) => {
    try {
      const docs = db.prepare("SELECT * FROM kyc_documents WHERE user_id = ?").all(req.user.id);
      res.json(docs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/kyc", authenticateToken, (req: any, res) => {
    try {
      const { type, fileName } = req.body;
      db.prepare("INSERT INTO kyc_documents (user_id, type, file_name, file_path) VALUES (?, ?, ?, ?)")
        .run(req.user.id, type, fileName, `/uploads/${fileName}`);
      logActivity(req.user.id, "KYC_UPLOADED", `Uploaded a new KYC document: ${type}`);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deal Hunter Settings
  app.post("/api/deal-hunter/settings", authenticateToken, (req: any, res) => {
    try {
      const { is_active, discount_threshold, max_bid_usd, auto_eoi_drafting, strategy_notes } = req.body;
      const existing = db.prepare("SELECT id FROM deal_hunter_settings WHERE user_id = ?").get(req.user.id);

      if (existing) {
        db.prepare(`
          UPDATE deal_hunter_settings 
          SET is_active = ?, discount_threshold = ?, max_bid_usd = ?, auto_eoi_drafting = ?, strategy_notes = ?
          WHERE user_id = ?
        `).run(is_active, discount_threshold, max_bid_usd, auto_eoi_drafting, strategy_notes, req.user.id);
      } else {
        db.prepare(`
          INSERT INTO deal_hunter_settings (user_id, is_active, discount_threshold, max_bid_usd, auto_eoi_drafting, strategy_notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(req.user.id, is_active, discount_threshold, max_bid_usd, auto_eoi_drafting, strategy_notes);
      }

      logActivity(req.user.id, "DEAL_HUNTER_CONFIGURED", "Updated Deal Hunter agent settings");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deal-hunter/settings", authenticateToken, (req: any, res) => {
    try {
      const settings = db.prepare("SELECT * FROM deal_hunter_settings WHERE user_id = ?").get(req.user.id);
      res.json(settings || { is_active: 0, discount_threshold: 15, max_bid_usd: 2000000, auto_eoi_drafting: 1, strategy_notes: 'distress' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Integration
  let stripeClient: Stripe | null = null;
  const getStripe = () => {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) return null;
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  };

  app.post("/api/create-checkout-session", authenticateToken, async (req: any, res) => {
    try {
      const { tier } = req.body;
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `INVESTMENTS PRO - ${tier} Tier`,
                description: `Upgrade to ${tier} status for advanced fiscal intelligence.`,
              },
              unit_amount: tier === 'PRO' ? 30000 : 12000,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_success=true&tier=${tier}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_cancel=true`,
        customer_email: req.user.email,
        metadata: { userId: req.user.id, tier }
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/update-tier", authenticateToken, (req: any, res) => {
    try {
      const { tier } = req.body;
      db.prepare("UPDATE users SET tier = ? WHERE id = ?").run(tier, req.user.id);
      logActivity(req.user.id, "SUBSCRIPTION_UPGRADED", `Upgraded subscription to ${tier} tier`);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // BSP Payment Gateway Integration (South Pacific)
  app.post("/api/bsp/initiate", authenticateToken, (req, res) => {
    try {
      const { tier } = req.body;
      const amount = tier === 'PRO' ? 300 : 120;
      const currency = 'FJD';
      const paymentUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/bsp/simulate-payment?tier=${tier}&amount=${amount}&currency=${currency}`;
      res.json({ paymentUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bsp/simulate-payment", (req, res) => {
    const { tier, amount, currency } = req.query;
    res.send(`
      <html>
        <head>
          <title>BSP Secure Payment Gateway</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 flex items-center justify-center min-h-screen p-4">
          <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="bg-[#005A31] p-8 text-white flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold tracking-tight">BSP Pay</h1>
                <p class="text-xs opacity-80 uppercase tracking-widest font-semibold mt-1">Secure Checkout</p>
              </div>
              <div class="text-3xl font-black italic">BSP</div>
            </div>
            <div class="p-8">
              <div class="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                <div>
                  <p class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Merchant Account</p>
                  <p class="font-bold text-gray-800">Alekesio Cavuilati</p>
                  <p class="text-[10px] text-gray-400">Account: 6330169 | SWIFT: BOSPFJFJ</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Amount</p>
                  <p class="text-2xl font-black text-[#005A31]">${currency} ${amount}.00</p>
                </div>
              </div>
              <div class="space-y-4 mb-8">
                <div>
                  <p class="text-[10px] text-gray-400 uppercase font-bold mb-2">Payment Description</p>
                  <p class="text-xs font-bold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">Investment Pro Sub - ${tier} Tier</p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Card Number</label>
                  <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-400">•••• •••• •••• ••••</div>
                </div>
              </div>
              <button 
                onclick="window.location.href='/?payment_success=true&tier=${tier}&gateway=bsp'"
                class="w-full bg-[#005A31] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#004a28] transition-all shadow-lg shadow-[#005A31]/20"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  // Catch-all for /api to prevent falling through to Vite
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
