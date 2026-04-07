DROP VIEW IF EXISTS Match_Seat_Map CASCADE;
DROP TABLE IF EXISTS Tickets CASCADE;
DROP TABLE IF EXISTS Match_Stands_Config CASCADE;
DROP TABLE IF EXISTS Matches CASCADE;
DROP TABLE IF EXISTS Match_Pricing CASCADE;
DROP TABLE IF EXISTS Seats CASCADE;
DROP TABLE IF EXISTS Blocks CASCADE;
DROP TABLE IF EXISTS Stands CASCADE;
DROP TABLE IF EXISTS Stadiums CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'User' CHECK (role IN ('User', 'Admin', 'Security')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base entity for the physical stadium
CREATE TABLE Stadiums (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'wankhede'
    name VARCHAR(100) NOT NULL,
    layout_data JSONB -- Stores the 2D/3D mapping data for the frontend
);

-- Child of Stadiums
CREATE TABLE Stands (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'vip_p' to match frontend
    stadium_id VARCHAR(50) REFERENCES Stadiums(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., 'VVIP'
    capacity INT NOT NULL,
    tier VARCHAR(20), -- 'Lower', 'Club', 'Upper'
    category VARCHAR(30) -- 'Economy', 'Premium', 'VIP'
);

-- Child of Stands (Partitions for larger stands)
CREATE TABLE Blocks (
    id SERIAL PRIMARY KEY,
    stand_id VARCHAR(50) REFERENCES Stands(id) ON DELETE CASCADE,
    stadium_id VARCHAR(50) REFERENCES Stadiums(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL -- e.g., 'Block A'
);

-- Child of Blocks (Physical Chairs)
CREATE TABLE Seats (
    id SERIAL PRIMARY KEY,
    block_id INT REFERENCES Blocks(id) ON DELETE CASCADE,
    stand_id VARCHAR(50) REFERENCES Stands(id) ON DELETE CASCADE,
    stadium_id VARCHAR(50) REFERENCES Stadiums(id) ON DELETE CASCADE,
    row_id VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    UNIQUE(block_id, row_id, seat_number)
);

-- Event entity linked to a Stadium
CREATE TABLE Matches (
    id SERIAL PRIMARY KEY,
    team_a VARCHAR(100) NOT NULL,
    team_b VARCHAR(100) NOT NULL,
    stadium_id VARCHAR(50) REFERENCES Stadiums(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL
);

-- Inventory pivot linking a Match and a Stand
CREATE TABLE Match_Stands_Config (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES Matches(id) ON DELETE CASCADE,
    stand_id VARCHAR(50) REFERENCES Stands(id) ON DELETE CASCADE,
    base_price DECIMAL(10, 2) NOT NULL,
    dynamic_pricing_factor DECIMAL(5, 2) DEFAULT 1.0,
    UNIQUE(match_id, stand_id)
);

-- Transaction ledger tying User, Match, and physical Seat
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    match_id INT REFERENCES Matches(id) ON DELETE CASCADE,
    seat_id INT REFERENCES Seats(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'Locked' CHECK (status IN ('Locked', 'Booked', 'Cancelled', 'verified')),
    face_embedding vector(128), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique composite index guaranteeing a physical seat can only be occupied by one person per match at a time
CREATE UNIQUE INDEX unique_active_ticket_per_seat 
ON Tickets(match_id, seat_id) 
WHERE status IN ('Locked', 'Booked', 'verified');

-- Live calculation engine joining physical seats with active tickets
CREATE VIEW Match_Seat_Map AS
SELECT 
    s.id AS seat_id,
    b.id AS block_id,
    b.name AS block_name,
    st.id AS stand_id,
    st.tier AS stand_tier,
    st.category AS stand_category,
    s.row_id,
    s.seat_number,
    m.id AS match_id,
    msc.base_price,
    msc.dynamic_pricing_factor,
    (msc.base_price * msc.dynamic_pricing_factor) AS current_price,
    COALESCE(t.status, 'Available') AS seat_status
FROM 
    Seats s
JOIN
    Blocks b ON b.id = s.block_id
JOIN
    Stands st ON st.id = b.stand_id
CROSS JOIN 
    Matches m
JOIN 
    Match_Stands_Config msc ON msc.match_id = m.id AND msc.stand_id = st.id
LEFT JOIN 
    Tickets t ON t.seat_id = s.id AND t.match_id = m.id AND t.status IN ('Locked', 'Booked', 'verified');

-- Disable Row Level Security to make all tables unrestricted
ALTER TABLE Users DISABLE ROW LEVEL SECURITY;
ALTER TABLE Stadiums DISABLE ROW LEVEL SECURITY;
ALTER TABLE Stands DISABLE ROW LEVEL SECURITY;
ALTER TABLE Blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE Seats DISABLE ROW LEVEL SECURITY;
ALTER TABLE Matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE Match_Stands_Config DISABLE ROW LEVEL SECURITY;
ALTER TABLE Tickets DISABLE ROW LEVEL SECURITY;