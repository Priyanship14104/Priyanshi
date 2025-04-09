import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import soap from "soap";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Helmet security
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "https://lh3.googleusercontent.com"],
  }
}));
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());

// Static
app.use(express.static(path.join(__dirname)));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    email: profile.emails[0].value,
    role: profile.emails[0].value.includes("admin") ? "admin" : "viewer"
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("/")
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).send("You must login");
}

// Protected route calling SOAP
app.get("/get-soap-result", ensureAuthenticated, async (req, res) => {
  const url = "http://localhost:8000/ws-security?wsdl";
  const args = {
    Security: { Username: "admin", Password: "password123" },
    input: "HelloWorld"
  };

  try {
    const client = await soap.createClientAsync(url);
    const [result] = await client.GetDataAsync(args);
    res.json(result);
  } catch (err) {
    console.error("SOAP error:", err);
    res.status(500).json({ error: "SOAP request failed" });
  }
});

// Start both Express and SOAP server
const soapApp = express();
const wsdlPath = path.join(__dirname, "service.wsdl");
const wsdl = fs.readFileSync(wsdlPath, "utf8");

// Simple user auth
const users = {
  "admin": "password123",
  "user": "userpass"
};

// SOAP service logic
const service = {
  WSService: {
    WSServicePortType: {
      GetData: (args, callback) => {
        console.log("SOAP Request received:", args);

        const securityHeader = args.Security;
        if (!securityHeader) {
          return callback({ message: "Missing WS-Security Header" });
        }

        const { Username, Password } = securityHeader;
        if (!users[Username] || users[Username] !== Password) {
          return callback({ message: "Authentication Failed" });
        }

        const input = args.input;
        const result = input.split("").reverse().join("");
        callback(null, { result });
      }
    }
  }
};

// Mount SOAP service
soap.listen(soapApp, "/ws-security", service, wsdl, () => {
  console.log("SOAP service running at http://localhost:8000/ws-security");
});
soapApp.listen(8000);

app.listen(PORT, () => {
  console.log(`Web app running at http://localhost:${PORT}`);
});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "frontend.html"));
  });
  