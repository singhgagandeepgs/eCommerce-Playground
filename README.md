# ShopPlay 🛍️

A modern, full-stack e-commerce web application built as a playground for automation testing. ShopPlay simulates a real-world shopping experience — complete with authentication, a product catalogue, cart management, Stripe payments, and an admin panel — making it an ideal target app for QA engineers and test automation demos.

**Live App:** [shopplay.vercel.app](https://shopplay.vercel.app)

---

## ✨ Features

### Shopper Experience
- **Product Catalogue** — Browse 8 products across Electronics, Clothing, Books, Home, and Sports categories
- **Search & Filter** — Real-time search and category filtering
- **Product Detail Pages** — Full product view with quantity selector
- **Shopping Cart** — Add, update, and remove items with a free shipping progress bar
- **Guest Cart Persistence** — Items saved to localStorage and merged into account on login/signup
- **Stripe Checkout** — Secure payment flow with test card support
- **Order Confirmation** — Confetti animation, order ID, and itemised receipt
- **Order History** — Complete order timeline with expandable details
- **User Profile** — Display name, avatar, order stats, and password management

### Admin Panel
- **Product Management** — Add, edit, and delete products via modal forms
- **Order Management** — View all orders and update statuses (Pending → Shipped → Delivered)
- **Role-based Access** — Admin panel only accessible to users with `admin` role

### Developer & Testing Features
- **`data-testid` attributes** on every interactive element — buttons, inputs, cards, forms
- **`POST /api/test-reset`** endpoint to clear cart and test orders between automation runs
- **Stripe test mode** — includes a collapsible Test Cards panel on the payment page
- **Row Level Security** — Supabase RLS policies ensure users only access their own data

---

## 🧪 Built for Automation Testing

ShopPlay was purpose-built as a testing playground. It covers a wide range of UI interactions that are ideal for writing automated test journeys:

| Test Journey | Covers |
|---|---|
| User signup flow | Form validation, email verification, redirect |
| Login and session management | Auth state, protected routes |
| Browse and filter products | Dynamic content, category filters, search |
| Add to cart (logged in) | API calls, cart badge update, toast notifications |
| Guest cart → login merge | localStorage, session handling |
| Successful checkout | Stripe Elements, multi-step indicator, confetti |
| Declined payment | Error handling, Stripe failure scenarios |
| 3D Secure payment | OTP authentication flow |
| Order history | Data rendering, accordion expand/collapse |
| Admin: add product | Modal form, validation, table update |
| Admin: update order status | Dropdown interaction, status badge change |
| Profile: update display name | Form input, save confirmation |

### Stripe Test Cards
| Scenario | Card Number |
|---|---|
| ✅ Success | `4242 4242 4242 4242` |
| ❌ Card declined | `4000 0000 0000 0002` |
| ❌ Insufficient funds | `4000 0000 0000 9995` |
| ❌ Expired card | `4000 0000 0000 0069` |
| 🔐 3D Secure | `4000 0027 6000 3184` |

Use any future expiry date and any 3-digit CVC.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** — utility-first styling with custom animations
- **React Router v6** — client-side routing
- **Supabase JS Client** — auth and direct database queries
- **Stripe.js + React Stripe Elements** — PCI-compliant payment UI
- **Inter** (Google Fonts) — typography

### Backend
- **Node.js + Express** — REST API server
- **Supabase** (service role) — privileged database operations
- **Stripe Node SDK** — PaymentIntent creation and verification

### Database & Auth
- **Supabase (PostgreSQL)** — products, orders, order_items, cart_items, profiles
- **Supabase Auth** — email/password signup, session management, JWT
- **Row Level Security** — per-user data isolation enforced at DB level

### Infrastructure
- **Vercel** — frontend hosting with auto-deploy from GitHub
- **Render** — backend hosting (Node web service)
- **UptimeRobot** — uptime monitoring, keeps Render instance warm
- **GitHub** — version control, CI/CD trigger

---

## 🗄️ Database Schema

```
auth.users (managed by Supabase)
    │
    ├── profiles (id, email, role, full_name, created_at)
    │
    ├── cart_items (id, user_id, product_id, quantity)
    │        └── products (id, name, description, price, image_url,
    │                      category, stock_quantity, created_at)
    └── orders (id, user_id, status, total_amount,
                payment_intent_id, payment_status, created_at)
             └── order_items (id, order_id, product_id, quantity, price)
```

---

## 🔐 Security

- **RLS policies** on all tables — users can only read/write their own rows
- **Admin role** enforced via `is_admin()` PostgreSQL function
- **Environment variables** for all secrets — never committed to source
- **Stripe test mode** — no real transactions possible without switching keys
- **CORS** configured to allow only the production frontend origin

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode)

### Setup

```bash
# Clone the repo
git clone https://github.com/singhgagandeepgs/eCommerce-Playground
cd eCommerce-Playground

# Install all dependencies (npm workspaces)
npm install

# Set up environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Fill in your Supabase and Stripe keys
```

### Environment Variables

**`frontend/.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_API_URL=http://localhost:4000
```

**`backend/.env`**
```
PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
CORS_ORIGIN=http://localhost:3000
```

### Run

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev

# Terminal 2 — Backend
cd backend && npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:4000

---

## 📁 Project Structure

```
eCommerce-playground/
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, ProductCard
│   │   ├── contexts/         # AuthContext, CartContext, ToastContext
│   │   ├── lib/              # supabase.js, api.js, cartUtils.js
│   │   ├── pages/            # All route-level page components
│   │   └── styles/           # Global CSS, Tailwind config
│   └── index.html
├── backend/
│   └── src/
│       ├── controllers/      # products, cart, orders, payments
│       ├── middleware/        # auth, error handling
│       └── routes/           # Express route definitions
└── package.json              # npm workspaces root
```

---

## 🧠 Built With

This project was built using **vibe coding** — an AI-assisted development approach where the entire codebase was generated and iterated using [Claude Code](https://claude.ai/code) by Anthropic. The focus was on product decisions, architecture, QA strategy, and shipping — rather than writing syntax manually.

---

## 📄 License

MIT
