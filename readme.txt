Shifting from a "stand-capacity" model to a "physical seat mapping" model requires updates across your entire stack. Based on your folder structure, here is the exact roadmap to make that shift, followed by a comprehensive README.md you can drop straight into your project.

How to Shift to Seat-Wise Implementation
1. Database Level (backend/database.sql)

Replace your old schema with the updated Assigned Seating schema we discussed earlier.

This introduces the seats table (linking to stands) and the match_seat_map SQL view.

2. Backend Level (backend/src/)

New Seed Script: You need a way to generate thousands of seats. Create a new file like backend/src/config/seedSeats.js that loops through rows (A-Z) and numbers (1-50) and inserts them into the seats table for each stand. You only run this once.

Update redisClient.js & bookingController.js: Change your Redis locking logic. Instead of locking a generic stand, your Redis key must now lock a specific seat: SET lock:${match_id}:${seat_id} "locked" EX 300 NX.

Update matchController.js: Update your API endpoints to fetch data from the match_seat_map view so it returns the status of individual seats instead of a total count.

3. Frontend Level (frontend/src/)

Update Stadium Files (stadiums/stad1.js, etc.): Currently, these likely just show clickable stands. You need to implement the "Drill-Down" UX. When a user clicks "North Executive" in stad1.js, it should open a modal or new view rendering a grid of individual seats based on the data fetched from the backend.

Update Checkout.jsx: Ensure the checkout payload now sends the seat_id to the backend, rather than just the stand_id.
# Crickeco (SecureSeat) - Advanced Ticket Booking System

SecureSeat is a highly scalable, ACID-compliant ticket booking platform designed for cricket stadiums. It features real-time seat locking to prevent user collisions, dynamic pricing, and AI-powered facial recognition for secure stadium entry.

## 🏗️ System Architecture

The application is built on a microservices-inspired architecture:
- **Frontend:** React.js (Vite) for a fast, interactive user interface.
- **Backend:** Node.js + Express.js handling business logic, ACID transactions, and Redis caching.
- **AI Service:** Python (FastAPI) running ONNX models for face detection and recognition.
- **Databases:** - **Supabase (PostgreSQL):** Core relational database for users, inventory, and ledger.
  - **Upstash (Redis):** Fast in-memory store for real-time seat locks and session management.

## 🚀 Core Workflows

### 1. User Booking Flow
1. **Browse:** User logs in and selects an upcoming match.
2. **Drill-Down:** User selects a stadium stand, revealing a real-time micro-grid of physical seats.
### 🧠 Technical Deep Dive: The "Drill-Down" Seat Architecture

Rendering a modern cricket stadium with 50,000+ seats simultaneously is a heavy operation that can cause severe DOM lag on mobile devices. SecureSeat solves this using a high-performance **Macro-to-Micro Drill-Down Architecture**.

**The Tech Stack & Implementation:**
* **Macro View (React + SVG):** The initial stadium layout is rendered using an interactive Scalable Vector Graphic (SVG). This map consists only of clickable polygon regions representing distinct Stands/Blocks, keeping the initial render incredibly lightweight.
* **State-Driven Lazy Loading (Axios + Express):** When a user clicks a specific stand, React transitions the view and triggers a targeted API call (`GET /api/matches/:matchId/stands/:standId/seats`). Data is lazy-loaded; the browser only fetches and processes seat data for the section the user is actively viewing.
* **Micro View & Matrix Rendering (CSS Grid/Canvas):** The backend queries the `match_seat_map` PostgreSQL View, returning the physical seat layout and real-time availability status for that specific block. React renders this smaller subset (e.g., 500 seats) via a highly optimized CSS Grid.
* **Real-Time Subscriptions (Supabase Realtime):** While in the Micro View, the frontend subscribes to database changes. If another user successfully completes an ACID checkout for a seat in the same block, the UI instantly updates the seat's status via WebSockets, preventing visual desynchronization before the Redis lock even needs to catch a collision.
3. **Lock:** User clicks a seat. The backend immediately requests a TTL lock in Redis (`lock:match_id:seat_id`).
   - *Collision Handling:* If another user clicks the same seat concurrently, the Redis lock prevents the second action, ensuring zero double-bookings.
4. **Identity Verification:** User uploads a photo of their face. The AI service processes this into a secure vector hash.
5. **ACID Checkout:** Payment is confirmed, and the ticket is inserted into PostgreSQL. The Redis lock is released, and the seat is permanently marked as 'Booked'.

### 2. Security Verification Flow
1. Security personnel log into the portal at the stadium gates.
2. Attendee approaches the gate; the system captures a live photo.
3. The AI service compares the live photo against the ticket's stored face data.
4. Upon a match, the ticket status updates to `verified` in the database, granting entry.

### 3. Admin Control Flow
1. Admins log in to configure new stadiums, stands, and matches.
2. **Dynamic Pricing:** Admins can adjust the `dynamic_pricing_factor` in real-time to implement surge pricing for high-demand matches.

## 📂 Project Structure (Bifurcation)

```text
CRICECO/
├── ai-service/                  # Python AI Microservice
│   ├── app/
│   │   ├── api/routes.py        # FastAPI endpoints for face processing
│   │   ├── core/face_utils.py   # OpenCV/ONNX logic
│   │   └── main.py              # Service entry point
│   ├── face_detection_yunet.onnx 
│   ├── face_recognition_sface.onnx
│   └── requirements.txt
├── backend/                     # Node.js API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            # Supabase PG connection
│   │   │   └── redisClient.js   # Upstash Redis connection
│   │   ├── controllers/         # Business logic (auth, booking, matches, etc.)
│   │   ├── middlewares/         # Role-based access control (Admin/Auth)
│   │   ├── routes/              # Express API routes
│   │   └── server.js            # Express server setup
│   ├── .env                     # Environment variables (Database URLs, Ports)
│   ├── database.sql             # Full PostgreSQL Schema & Views
│   └── hash.js                  # Security utilities
└── frontend/                    # React SPA
    ├── src/
    │   ├── components/          # Reusable UI widgets
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Login.jsx
    │   │   ├── MyTickets.jsx
    │   │   ├── SecurityScan.jsx
    │   │   └── UserPortal.jsx
    │   ├── services/            # API client wrappers (Axios/Fetch)
    │   ├── stadiums/            # Interactive SVG/Canvas seat maps
    │   │   ├── index.js
    │   │   ├── stad1.js
    │   │   ├── stad2.js
    │   │   └── stad3.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json


🗄️ Database Schema & Relationships
The PostgreSQL database is fully relational, ensuring inventory is isolated per match, even within the same physical stadium.

stadiums: Base entity (e.g., Eden Gardens).

stands: Child of Stadiums (e.g., North Pavilion). 1:N relationship.

seats: Child of Stands. Represents physical chairs (Row A, Seat 1). 1:N relationship.

matches: Event entity linked to a Stadium. 1:N relationship.

match_stands_config: The inventory pivot. Links a Match and a Stand, setting the base price and dynamic pricing factor for that specific event.

tickets: The transaction ledger. Links a User, Match, and Seat.

Constraint: Contains a unique composite index (match_id, seat_id) where status is active, mathematically guaranteeing a physical seat can only be occupied by one person per match.

match_seat_map (View): A live calculation engine that joins physical seats with active tickets to serve the exact grid availability to the frontend.