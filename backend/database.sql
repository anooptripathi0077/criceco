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

-- Payment transactions table
CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    order_id VARCHAR(255) UNIQUE NOT NULL,
    payment_id VARCHAR(255),
    signature VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50), -- 'card', 'upi', 'net_banking', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction ledger tying User, Match, and physical Seat
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    match_id INT REFERENCES Matches(id) ON DELETE CASCADE,
    seat_id INT REFERENCES Seats(id) ON DELETE CASCADE,
    payment_id INT REFERENCES Payments(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Locked' CHECK (status IN ('Locked', 'Booked', 'Cancelled', 'verified')),
    face_embedding vector(128), 
    ticket_price DECIMAL(10, 2),
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
ALTER TABLE Tickets 
ADD COLUMN IF NOT EXISTS payment_id INT REFERENCES Payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10, 2);



-- 1. Create the Bank Table 
CREATE TABLE IF NOT EXISTS Bank (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    payment_id INT NOT NULL REFERENCES Payments(id) ON DELETE CASCADE,
    
    card_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(20),
    branch_name VARCHAR(255),
    ifsc_code VARCHAR(11),
    
    card_id VARCHAR(255) UNIQUE,
    card_number VARCHAR(20) NOT NULL, 
    card_type VARCHAR(50), 
    expiry_month INT,
    expiry_year INT,
    cvv VARCHAR(10), 
    
    transaction_reference VARCHAR(255) UNIQUE,
    transaction_amount DECIMAL(10, 2) NOT NULL,
    transaction_currency VARCHAR(3) DEFAULT 'INR',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    account_holder_name VARCHAR(255),
    account_number VARCHAR(255),
    account_type VARCHAR(50), 
    
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the Indexes (For read performance)
CREATE INDEX IF NOT EXISTS idx_user_id ON Bank(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_id ON Bank(payment_id);
CREATE INDEX IF NOT EXISTS idx_card_number ON Bank(card_number);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON Bank(transaction_date);

-- 3. Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_bank_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bank_updated_at
BEFORE UPDATE ON Bank
FOR EACH ROW
EXECUTE FUNCTION update_bank_timestamp();

-- 4. Verify and Insert Default User (User ID: 8)
-- Ensure this runs successfully. It correctly binds to the User ID 8 you are using.
INSERT INTO Bank (
    user_id, payment_id, card_holder_name, bank_name, card_number,
    card_type, expiry_month, expiry_year, transaction_amount,
    transaction_reference, transaction_date
) VALUES (
    8, 17, 'John Doe', 'HDFC Bank', '1111',
    'Visa', 12, 2025, 5102.00,
    'txn_1776625000000', NOW()
);
