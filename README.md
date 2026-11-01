# SecureSeat: High-Concurrency Ticket Booking & Biometric Verification System

![SecureSeat Architecture](arch_diagram.png) ## 📌 Overview
SecureSeat is a scalable, full-stack ticket booking platform designed to handle high-concurrency booking scenarios while preventing ticket scalping. It features a distributed caching mechanism to handle temporary seat locks and integrates an AI-powered facial recognition microservice to bind tickets to a user's biometric identity using vector embeddings.

## ✨ Key Features
* **High-Concurrency Seat Locking:** Utilizes Redis distributed locks to hold a seat for exactly 10 minutes during the checkout phase, preventing double-booking and race conditions.
* **Biometric Anti-Scalping:** Captures user photos at checkout, generates facial vector embeddings via a Python microservice, and verifies attendees on-the-spot at the venue using cosine similarity matching.
* **Role-Based Access Control (RBAC):** Three distinct portals:
    * **Admin Dashboard:** Create matches, configure 2D/3D stadium layouts, and set dynamic pricing for seating tiers.
    * **User Portal:** Browse upcoming matches, interact with stadium seating maps, and book tickets securely.
    * **Security Portal:** A minimal UI for on-site personnel to snap attendee photos and instantly validate ticket ownership.

## 🛠️ Tech Stack
**Frontend:**
* React.js
* Three.js / React Three Fiber (For 3D stadium seat mapping)
* HTML5 WebRTC API (For browser-based photo capture)

**Main Backend (Booking Engine):**
* Node.js & Express.js
* PostgreSQL (Primary database for ACID compliance on transactions)
* Redis (For 10-minute seat locking and session management)

**AI & Security Microservice:**
* Python & FastAPI
* OpenCV & MediaPipe (For face detection and feature extraction)
* `pgvector` (PostgreSQL extension for storing and querying embeddings)

---

## 🏗️ System Architecture Flow

1.  **Booking Phase:** User selects a seat -> System checks Redis for a lock. If free, creates a lock with a 600s TTL -> User completes checkout & takes photo -> Backend finalizes PostgreSQL transaction & calls AI service to store vector embedding.
2.  **Entry Phase:** Security scans ticket ID -> Takes live photo of attendee -> AI service generates real-time vector -> Compares with stored vector using Cosine Similarity -> Returns ✅ (Match) or ❌ (Mismatch).

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* PostgreSQL (with `pgvector` extension installed)
* Redis Server (running locally or via Docker)

### Installation

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/SecureSeat.git](https://github.com/yourusername/SecureSeat.git)
cd SecureSeat
