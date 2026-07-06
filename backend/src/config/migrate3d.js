const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate_3d() {
    const client = await pool.connect();
    try {
        console.log("Starting 3D Viewer Migration...");

        console.log("1. Adding model_url to stadiums table...");
        await client.query(`
            ALTER TABLE stadiums 
            ADD COLUMN IF NOT EXISTS model_url text;
        `);

        console.log("2. Adding camera coordinates to blocks table...");
        await client.query(`
            ALTER TABLE blocks 
            ADD COLUMN IF NOT EXISTS camera_x numeric DEFAULT 0,
            ADD COLUMN IF NOT EXISTS camera_y numeric DEFAULT 50,
            ADD COLUMN IF NOT EXISTS camera_z numeric DEFAULT 100;
        `);

        console.log("3. Updating match_seat_map view...");
        await client.query(`
            CREATE OR REPLACE VIEW public.match_seat_map AS 
            SELECT s.id AS seat_id,
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
                COALESCE(t.status, 'Available'::character varying) AS seat_status,
                b.camera_x,
                b.camera_y,
                b.camera_z
            FROM (((((seats s
                JOIN blocks b ON ((b.id = s.block_id)))
                JOIN stands st ON (((st.id)::text = (b.stand_id)::text)))
                CROSS JOIN matches m)
                JOIN match_stands_config msc ON (((msc.match_id = m.id) AND ((msc.stand_id)::text = (st.id)::text))))
                LEFT JOIN tickets t ON (((t.seat_id = s.id) AND (t.match_id = m.id) AND ((t.status)::text = ANY ((ARRAY['Locked'::character varying, 'Booked'::character varying, 'verified'::character varying])::text[])))));
        `);

        console.log("4. Seeding placeholder 3D Model URL for all stadiums...");
        // Using a basic Duck GLTF model for visual testing since we don't have a stadium yet
        await client.query(`
            UPDATE stadiums 
            SET model_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb'
            WHERE model_url IS NULL;
        `);

        console.log("5. Seeding random mock coordinates for blocks...");
        const res = await client.query(`SELECT id FROM blocks`);
        for (const row of res.rows) {
            // Assign some random mock coordinates so we can test the camera transition
            const cx = Math.floor(Math.random() * 200) - 100; // -100 to 100
            const cy = Math.floor(Math.random() * 100) + 10;   // 10 to 110
            const cz = Math.floor(Math.random() * 200) - 100; // -100 to 100
            
            await client.query(`
                UPDATE blocks 
                SET camera_x = $1, camera_y = $2, camera_z = $3
                WHERE id = $4
            `, [cx, cy, cz, row.id]);
        }
        
        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Error running migration:", err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate_3d();