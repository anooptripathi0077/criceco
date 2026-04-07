const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api/bookings/lock-seat';
const JWT_SECRET = process.env.JWT_SECRET;
const NUM_REQUESTS = 1000;
const MATCH_ID = 1;
const SEAT_ID = 1;

async function runConcurrencyTest() {
    console.log(`🚀 Starting Concurrency Test: ${NUM_REQUESTS} parallel requests for Match ${MATCH_ID}, Seat ${SEAT_ID}...`);

    const requests = [];

    for (let i = 1; i <= NUM_REQUESTS; i++) {
        // Generate a unique token for each "user"
        const token = jwt.sign({ id: i, role: 'User', email: `testuser${i}@example.com` }, JWT_SECRET);
        
        requests.push(
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ matchId: MATCH_ID, seatId: SEAT_ID })
            })
            .then(async res => ({
                status: res.status,
                data: await res.json().catch(() => ({}))
            }))
            .catch(err => ({
                status: 'ERROR',
                error: err.message
            }))
        );
    }

    const results = await Promise.all(requests);

    const summary = {
        success: 0,
        conflict: 0,
        error: 0,
        other: {}
    };

    results.forEach(res => {
        if (res.status === 200 || res.status === 201) summary.success++;
        else if (res.status === 409) summary.conflict++;
        else if (res.status === 'ERROR') summary.error++;
        else {
            summary.other[res.status] = (summary.other[res.status] || 0) + 1;
        }
    });

    console.log('\n📊 --- TEST RESULTS ---');
    console.log(`✅ Successes (Lock Acquired): ${summary.success}`);
    console.log(`🚫 Conflicts (Lock Denied):   ${summary.conflict}`);
    console.log(`❌ Network/Server Errors:     ${summary.error}`);
    Object.keys(summary.other).forEach(code => {
        console.log(`❓ Status ${code}:             ${summary.other[code]}`);
    });
    
    if (summary.success === 1) {
        console.log('\n🎉 TEST PASSED: Exactly 1 user acquired the lock!');
    } else {
        console.log(`\n⚠️ TEST FAILED: Expected 1 success but got ${summary.success}.`);
    }
}

runConcurrencyTest();
