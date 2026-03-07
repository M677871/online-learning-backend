module.exports = async () => {
    try {
        const pool = require('../../src/config/db');
        if (pool && typeof pool.end === 'function') {
            await pool.end();
        }
    } catch (_error) {
        // Ignore teardown errors in isolated unit tests.
    }
};
