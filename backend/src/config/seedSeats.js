const fs = require('fs');
const path = require('path');
const dbPool = require('./db');

async function runSeed() {
    console.log('🌱 Starting Comprehensive Database Seed (3 Stadiums, 15 Matches)...');
    
    // 1. Read and execute the database.sql schema
    console.log('Executing database schema from database.sql...');
    const sqlPath = path.join(__dirname, '../../database.sql');
    const schemaSql = fs.readFileSync(sqlPath, 'utf8');
    
    const client = await dbPool.connect();
    
    try {
        await client.query('BEGIN');
        
        await client.query(schemaSql);
        console.log('✅ Schema recreated successfully!');

        // 2. Insert dummy Users
        console.log('Creating demo users...');
        await client.query(`
            INSERT INTO Users (name, email, password_hash, role) 
            VALUES ('Demo User', 'demo@example.com', 'dummy_hash', 'User')
            ON CONFLICT (email) DO NOTHING
        `);

        // 3. Seed Stadiums
        console.log('Seeding 3 Stadiums...');
        await client.query(`
            INSERT INTO Stadiums (id, name, layout_data)
            VALUES 
            ('wankhede', 'Wankhede Stadium', null),
            ('eden_gardens', 'Eden Gardens', null),
            ('ahmedabad', 'Narendra Modi Stadium', null)
            ON CONFLICT (id) DO NOTHING
        `);

        // 4. Seed Stands with Architectural Metadata
        console.log('Seeding Stands with Real-World Tiers and Categories...');
        
        const wankhedeStands = [
            { id: 'vip_p', name: 'VVIP Premium', cap: 800, tier: 'Club', cat: 'VIP' },
            { id: 'i1', name: 'N Lower A', cap: 2200, tier: 'Lower', cat: 'Premium' },
            { id: 'i2', name: 'N Lower B', cap: 2200, tier: 'Lower', cat: 'Premium' },
            { id: 'i3', name: 'East Lower', cap: 3400, tier: 'Lower', cat: 'Premium' },
            { id: 'i4', name: 'South Pavilion', cap: 4200, tier: 'Club', cat: 'Premium' },
            { id: 'i5', name: 'West Lower', cap: 3200, tier: 'Lower', cat: 'Premium' },
            { id: 'm1', name: 'North Executive', cap: 4800, tier: 'Club', cat: 'Premium' },
            { id: 'vip_g', name: 'South Grandstand', cap: 2000, tier: 'Club', cat: 'VIP' },
            { id: 'm2', name: 'East Grandstand', cap: 5200, tier: 'Lower', cat: 'General' },
            { id: 'm4', name: 'West Grandstand', cap: 5000, tier: 'Lower', cat: 'General' },
            { id: 'o1', name: 'NW Upper', cap: 6000, tier: 'Upper', cat: 'Economy' },
            { id: 'o2', name: 'NE Upper', cap: 6000, tier: 'Upper', cat: 'Economy' },
            { id: 'o3', name: 'SE Upper', cap: 7000, tier: 'Upper', cat: 'Economy' },
            { id: 'o4', name: 'SW Upper', cap: 7000, tier: 'Upper', cat: 'Economy' }
        ];

        const edenGardensStands = [
            { id: 'eg_club', name: 'Club House', cap: 600, tier: 'Club', cat: 'VIP' },
            { id: 'eg_b', name: 'B Block', cap: 3000, tier: 'Lower', cat: 'Premium' },
            { id: 'eg_a', name: 'A Block', cap: 3000, tier: 'Lower', cat: 'Premium' },
            { id: 'eg_h', name: 'H Block', cap: 4000, tier: 'Lower', cat: 'General' },
            { id: 'eg_g', name: 'G Block', cap: 3800, tier: 'Lower', cat: 'General' },
            { id: 'eg_f', name: 'F Block', cap: 3600, tier: 'Lower', cat: 'General' },
            { id: 'eg_vip', name: 'VIP Pavilion', cap: 1200, tier: 'Club', cat: 'VIP' },
            { id: 'eg_exec_n', name: 'North Executive', cap: 5500, tier: 'Club', cat: 'Premium' },
            { id: 'eg_exec_s', name: 'South Executive', cap: 5500, tier: 'Club', cat: 'Premium' },
            { id: 'eg_gen_e', name: 'East General', cap: 9000, tier: 'Lower', cat: 'Economy' },
            { id: 'eg_gen_w', name: 'West General', cap: 8500, tier: 'Lower', cat: 'Economy' },
            { id: 'eg_u1', name: 'Upper North', cap: 10000, tier: 'Upper', cat: 'General' },
            { id: 'eg_u2', name: 'Upper South', cap: 10000, tier: 'Upper', cat: 'General' },
            { id: 'eg_u3', name: 'Upper East', cap: 8000, tier: 'Upper', cat: 'General' }
        ];

        const ahmedabadStands = [
            { id: 'l_n', name: 'North Lower', cap: 6500, tier: 'Lower', cat: 'General' },
            { id: 'l_ne', name: 'NE Lower', cap: 8000, tier: 'Lower', cat: 'General' },
            { id: 'l_e', name: 'East Lower', cap: 7000, tier: 'Lower', cat: 'General' },
            { id: 'l_se', name: 'SE Lower', cap: 8000, tier: 'Lower', cat: 'General' },
            { id: 'l_s', name: 'South Lower', cap: 6500, tier: 'Lower', cat: 'General' },
            { id: 'l_sw', name: 'SW Lower', cap: 8000, tier: 'Lower', cat: 'General' },
            { id: 'l_w', name: 'West Lower', cap: 7000, tier: 'Lower', cat: 'General' },
            { id: 'l_nw', name: 'NW Lower', cap: 8000, tier: 'Lower', cat: 'General' },
            { id: 'c_n', name: 'North VIP Box', cap: 1500, tier: 'Club', cat: 'VIP' },
            { id: 'c_e', name: 'East Corporate', cap: 3500, tier: 'Club', cat: 'Premium' },
            { id: 'c_s', name: 'Presidential Box', cap: 1000, tier: 'Club', cat: 'VIP' },
            { id: 'c_w', name: 'West Corporate', cap: 3500, tier: 'Club', cat: 'Premium' },
            { id: 'u_n', name: 'North Upper', cap: 12000, tier: 'Upper', cat: 'Economy' },
            { id: 'u_e1', name: 'East Upper N', cap: 12000, tier: 'Upper', cat: 'Economy' },
            { id: 'u_e2', name: 'East Upper S', cap: 12000, tier: 'Upper', cat: 'Economy' },
            { id: 'u_s', name: 'South Upper', cap: 12000, tier: 'Upper', cat: 'Economy' },
            { id: 'u_w1', name: 'West Upper S', cap: 12000, tier: 'Upper', cat: 'Economy' },
            { id: 'u_w2', name: 'West Upper N', cap: 12000, tier: 'Upper', cat: 'Economy' }
        ];

        const allStadiums = [
            { stdId: 'wankhede', stands: wankhedeStands },
            { stdId: 'eden_gardens', stands: edenGardensStands },
            { stdId: 'ahmedabad', stands: ahmedabadStands }
        ];

        for (const std of allStadiums) {
            for (const stand of std.stands) {
                await client.query(
                    `INSERT INTO Stands (id, stadium_id, name, capacity, tier, category) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
                    [stand.id, std.stdId, stand.name, stand.cap, stand.tier, stand.cat]
                );
            }
        }

        // 5. Seed Blocks and Physical Seats (FULL CAPACITY - 100% Fidelity)
        console.log('Seeding 8 Equal Blocks per Stand with Architectural Geometry...');
        const blockNames = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G', 'Block H'];
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        for (const std of allStadiums) {
            console.log(`- Populating ${std.stdId}...`);
            for (const stand of std.stands) {
                const seatsPerBlock = Math.floor(stand.cap / 8);
                const remainder = stand.cap % 8;

                for (let i = 0; i < 8; i++) {
                    const blockResult = await client.query(
                        `INSERT INTO Blocks (stand_id, stadium_id, name) VALUES ($1, $2, $3) RETURNING id`,
                        [stand.id, std.stdId, blockNames[i]]
                    );
                    const blockId = blockResult.rows[0].id;
                    const seatsInThisBlock = seatsPerBlock + (i < remainder ? 1 : 0);

                    // --- ARCHITECTURAL GEOMETRY ENGINE ---
                    let seatsPerRow;
                    if (stand.tier === 'Upper') {
                        seatsPerRow = 60; // Wide & Panoramic
                    } else if (stand.tier === 'Lower') {
                        seatsPerRow = 20; // Deep & Steep
                    } else {
                        seatsPerRow = 15; // Intimate & Symmetrical
                    }

                    const numRows = Math.ceil(seatsInThisBlock / seatsPerRow);
                    let seatValues = [];

                    for (let r = 0; r < numRows; r++) {
                        const rowId = alphabet[r % alphabet.length] + (Math.floor(r / alphabet.length) || '');
                        for (let s = 1; s <= seatsPerRow; s++) {
                            const seatIdx = (r * seatsPerRow) + s;
                            if (seatIdx > seatsInThisBlock) break;
                            
                            // Include stadium_id and stand_id for high-speed direct lookup performance
                            seatValues.push(`(${blockId}, '${stand.id}', '${std.stdId}', '${rowId}', ${s})`);
                            
                            // High-Performance Batch Insertion (Flush at 5,000 to prevent buffer overflow)
                            if (seatValues.length >= 5000) {
                                await client.query(`INSERT INTO Seats (block_id, stand_id, stadium_id, row_id, seat_number) VALUES ${seatValues.join(',')}`);
                                seatValues = [];
                            }
                        }
                    }

                    if (seatValues.length > 0) {
                        await client.query(`INSERT INTO Seats (block_id, stand_id, stadium_id, row_id, seat_number) VALUES ${seatValues.join(',')}`);
                    }
                }
            }
        }
        console.log('✅ Generated ~275,000 physical seats with unique stadium layouts!');

        // 6. Seed 15 Matches
        console.log('Seeding 15 Demo Matches...');
        
        const teams = ['MI', 'CSK', 'KKR', 'RCB', 'DC', 'RR', 'PBKS', 'SRH', 'LSG', 'GT'];
        let matchValues = [];
        let index = 1;
        let generatedMatchIds = [];
        let matchStadiumMapping = [];

        // 5 matches per stadium
        const dates = [
            '2025-04-15 19:30:00', '2025-04-18 19:30:00', '2025-04-20 15:30:00', 
            '2025-04-22 19:30:00', '2025-04-25 19:30:00'
        ];

        for (const std of allStadiums) {
            for (let i = 0; i < 5; i++) {
                let t1 = teams[index % teams.length];
                let t2 = teams[(index + 3) % teams.length]; // randomish opponent
                matchValues.push(`(${index}, '${t1}', '${t2}', '${std.stdId}', '${dates[i]}')`);
                generatedMatchIds.push(index);
                matchStadiumMapping.push({ matchId: index, stadiumId: std.stdId });
                index++;
            }
        }

        if (matchValues.length > 0) {
            await client.query(`
                INSERT INTO Matches (id, team_a, team_b, stadium_id, date)
                VALUES ${matchValues.join(',')}
                ON CONFLICT (id) DO NOTHING
            `);
        }

        // 7. Seed Match_Stands_Config
        console.log('Seeding Match Pricing Config for 15 matches...');
        let configInserts = [];
        for (const mapping of matchStadiumMapping) {
            const stdStands = allStadiums.find(s => s.stdId === mapping.stadiumId).stands;
            for (const stand of stdStands) {
                const basePrice = Math.floor(Math.random() * 5000) + 1500; 
                configInserts.push(`(${mapping.matchId}, '${stand.id}', ${basePrice}, 1.0)`);
            }
        }
        
        // Chunk insertion
        const chunkSize = 100;
        for (let i = 0; i < configInserts.length; i += chunkSize) {
            const chunk = configInserts.slice(i, i + chunkSize);
            await client.query(`
                INSERT INTO Match_Stands_Config (match_id, stand_id, base_price, dynamic_pricing_factor)
                VALUES ${chunk.join(',')} 
                ON CONFLICT (match_id, stand_id) DO NOTHING
            `);
        }

        await client.query('COMMIT');
        console.log('🎉 Database seeding complete! 3 Stadiums, 15 Matches populated with dynamic representative grids.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

runSeed();
