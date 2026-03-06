import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const firestore = admin.firestore();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-investment-pro-key";

// Helper for Firestore
const getDocs = async (collection: string) => {
  const snapshot = await firestore.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getDoc = async (collection: string, id: string) => {
  const doc = await firestore.collection(collection).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

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
const seedNews = async () => {
  const newsSnapshot = await firestore.collection("news").limit(1).get();
  if (newsSnapshot.empty) {
    const news = [
      { title: "Fiji SLIP Tax Update 2026", content: "New amendments to the Short Life Investment Package (SLIP) provide 10-year tax holidays for hotel developments over $7M FJD.", country: "Fiji", category: "Tax", published_at: new Date().toISOString() },
      { title: "Australia FIRB Thresholds Adjusted", content: "Foreign Investment Review Board (FIRB) has increased thresholds for commercial real estate acquisitions in Sydney and Melbourne.", country: "Australia", category: "Legal", published_at: new Date().toISOString() },
      { title: "UAE Golden Visa Expansion", content: "Dubai announces new pathways for property investors to secure 10-year residency with reduced minimum investment requirements.", country: "UAE", category: "Legal", published_at: new Date().toISOString() }
    ];
    for (const item of news) {
      await firestore.collection("news").add(item);
    }
  }
};
seedNews();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Activity Logs
  const logActivity = async (userId: string, action: string, details: string) => {
    await firestore.collection("activity_logs").add({
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    });
  };

  app.get("/api/activity", authenticateToken, async (req: any, res: any) => {
    try {
      const logs = await firestore.collection("activity_logs")
        .where("user_id", "==", req.user.id)
        .orderBy("created_at", "desc")
        .limit(20)
        .get();
      res.json(logs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Posts / Home Feed
  app.get("/api/posts", authenticateToken, async (req: any, res: any) => {
    try {
      const postsSnapshot = await firestore.collection("posts")
        .orderBy("created_at", "desc")
        .get();

      const posts = [];
      for (const doc of postsSnapshot.docs) {
        const postData = doc.data();
        const user = await getDoc("users", postData.user_id) as any;
        posts.push({
          id: doc.id,
          ...postData,
          user_name: user?.name || "Unknown",
          avatar_url: user?.avatar_url || ""
        });
      }
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", authenticateToken, async (req: any, res: any) => {
    try {
      const { content, image_url, type, country, city, price, rent } = req.body;
      const post = {
        user_id: req.user.id,
        content,
        image_url,
        type: type || 'NORMAL',
        country,
        city,
        price,
        rent,
        likes: 0,
        created_at: new Date().toISOString()
      };
      await firestore.collection("posts").add(post);
      logActivity(req.user.id, "POST_CREATED", `Created a new ${type || 'NORMAL'} post on the home feed`);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/like", authenticateToken, async (req: any, res: any) => {
    try {
      const postRef = firestore.collection("posts").doc(req.params.id);
      const post = await postRef.get();
      if (!post.exists) return res.status(404).json({ error: "Post not found" });

      const currentLikes = post.data()?.likes || 0;
      await postRef.update({ likes: currentLikes + 1 });
      res.json({ success: true, likes: currentLikes + 1 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/analysis", authenticateToken, async (req: any, res: any) => {
    const { id } = req.params;
    const { analysis } = req.body;
    try {
      await firestore.collection("posts").doc(id).update({
        analysis_results: JSON.stringify(analysis)
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notification Preferences
  app.get("/api/notifications/settings", authenticateToken, async (req: any, res: any) => {
    try {
      const settings = await getDoc("notification_preferences", req.user.id);
      res.json(settings || { email_alerts: 1, push_notifications: 1, market_updates: 1, deal_alerts: 1 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/notifications/settings", authenticateToken, async (req: any, res: any) => {
    try {
      const { email_alerts, push_notifications, market_updates, deal_alerts } = req.body;
      await firestore.collection("notification_preferences").doc(req.user.id).set({
        email_alerts: email_alerts ? 1 : 0,
        push_notifications: push_notifications ? 1 : 0,
        market_updates: market_updates ? 1 : 0,
        deal_alerts: deal_alerts ? 1 : 0
      }, { merge: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Profile Update
  app.put("/api/user/profile", authenticateToken, async (req: any, res: any) => {
    try {
      const { name, bio, phone, avatar_url } = req.body;
      await firestore.collection("users").doc(req.user.id).update({
        name, bio, phone, avatar_url
      });
      logActivity(req.user.id, "PROFILE_UPDATED", "Updated profile information");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Set trial to 3 days from now
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3);

      const userRef = firestore.collection("users").doc();
      const userData = {
        email,
        password: hashedPassword,
        name,
        tier: 'STANDARD',
        kyc_status: 'PENDING',
        proof_of_funds_usd: 0,
        entity_type: 'Individual',
        country_of_origin: 'AU',
        trial_ends_at: trialEndsAt.toISOString(),
        created_at: new Date().toISOString()
      };

      await userRef.set(userData);

      const user = { id: userRef.id, email, name, trial_ends_at: userData.trial_ends_at };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const userSnapshot = await firestore.collection("users").where("email", "==", email).limit(1).get();

      if (userSnapshot.empty) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const userDoc = userSnapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() } as any;

      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    const user = await getDoc("users", req.user.id);
    res.json(user);
  });

  // WebSocket Logic
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on("send_message", async (data) => {
      const { sender_id, receiver_id, content } = data;
      await firestore.collection("messages").add({
        sender_id,
        receiver_id,
        content,
        created_at: new Date().toISOString()
      });
      io.to(`user_${receiver_id}`).emit("new_message", data);
      io.to(`user_${sender_id}`).emit("new_message", data);
    });

    socket.on("typing", (data) => {
      io.to(`user_${data.receiver_id}`).emit("user_typing", { sender_id: data.sender_id });
    });
  });

  // API Routes
  app.post("/api/feedback", authenticateToken, async (req: any, res: any) => {
    try {
      const { project_id, rating, comment } = req.body;
      await firestore.collection("feedback").add({
        user_id: req.user.id,
        project_id,
        rating,
        comment,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await getDoc("users", req.user.id);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users", authenticateToken, async (req: any, res: any) => {
    const users = await getDocs("users");
    res.json(users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, kyc_status: u.kyc_status })));
  });

  app.get("/api/friends", authenticateToken, async (req: any, res: any) => {
    const userId = req.user.id;
    const friendsSnapshot = await firestore.collection("friends")
      .where("user_id", "==", userId)
      .get();
    const friendsSnapshot2 = await firestore.collection("friends")
      .where("friend_id", "==", userId)
      .get();

    const friendIds = new Set();
    friendsSnapshot.docs.forEach(doc => friendIds.add(doc.data().friend_id));
    friendsSnapshot2.docs.forEach(doc => friendIds.add(doc.data().user_id));

    const friends = [];
    for (const id of Array.from(friendIds)) {
      const user = await getDoc("users", id as string);
      if (user) friends.push({ ...user, status: 'ACCEPTED' });
    }
    res.json(friends);
  });

  app.post("/api/friends", authenticateToken, async (req: any, res: any) => {
    const { friend_id } = req.body;
    await firestore.collection("friends").add({
      user_id: req.user.id,
      friend_id,
      status: 'ACCEPTED',
      created_at: new Date().toISOString()
    });
    res.json({ success: true });
  });

  app.get("/api/messages/:friendId", authenticateToken, async (req: any, res: any) => {
    const userId = req.user.id;
    const { friendId } = req.params;
    const m1 = await firestore.collection("messages")
      .where("sender_id", "==", userId)
      .where("receiver_id", "==", friendId)
      .get();
    const m2 = await firestore.collection("messages")
      .where("sender_id", "==", friendId)
      .where("receiver_id", "==", userId)
      .get();

    const messages = [...m1.docs, ...m2.docs]
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    res.json(messages);
  });

  app.get("/api/news", async (req, res) => {
    try {
      const news = await getDocs("news");
      res.json(news);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects", authenticateToken, async (req: any, res: any) => {
    try {
      const projects = await firestore.collection("projects")
        .where("user_id", "==", req.user.id)
        .orderBy("created_at", "desc")
        .get();
      res.json(projects.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects", authenticateToken, async (req: any, res: any) => {
    try {
      const project = {
        ...req.body,
        user_id: req.user.id,
        created_at: new Date().toISOString()
      };
      const docRef = await firestore.collection("projects").add(project);
      logActivity(req.user.id, "PROJECT_SAVED", `Saved a new investment project: ${req.body.name}`);
      res.json({ id: docRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/kyc", authenticateToken, async (req: any, res: any) => {
    try {
      const docs = await firestore.collection("kyc_documents")
        .where("user_id", "==", req.user.id)
        .get();
      res.json(docs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/kyc", authenticateToken, async (req: any, res: any) => {
    try {
      const { type, fileName } = req.body;
      const doc = {
        user_id: req.user.id,
        type,
        file_name: fileName,
        file_path: `/uploads/${fileName}`,
        uploaded_at: new Date().toISOString()
      };
      await firestore.collection("kyc_documents").add(doc);
      logActivity(req.user.id, "KYC_UPLOADED", `Uploaded a new KYC document: ${type}`);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deal Hunter Settings
  app.post("/api/deal-hunter/settings", authenticateToken, async (req: any, res: any) => {
    try {
      const { is_active, discount_threshold, max_bid_usd, auto_eoi_drafting, strategy_notes } = req.body;
      await firestore.collection("deal_hunter_settings").doc(req.user.id).set({
        is_active, discount_threshold, max_bid_usd, auto_eoi_drafting, strategy_notes
      }, { merge: true });

      logActivity(req.user.id, "DEAL_HUNTER_CONFIGURED", "Updated Deal Hunter agent settings");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deal-hunter/settings", authenticateToken, async (req: any, res: any) => {
    try {
      const settings = await getDoc("deal_hunter_settings", req.user.id);
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

  app.post("/api/update-tier", authenticateToken, async (req: any, res: any) => {
    try {
      const { tier } = req.body;
      await firestore.collection("users").doc(req.user.id).update({ tier });
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
