const mariadb = require('mariadb');
require('dotenv').config();

const maxAttempts = parseInt(process.env.DB_WAIT_MAX_ATTEMPTS, 10) || 30;
const delayMs = parseInt(process.env.DB_WAIT_DELAY_MS, 10) || 2000;

const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'csis_228_project'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDatabase() {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        let connection;

        try {
            connection = await mariadb.createConnection(connectionConfig);
            await connection.query('SELECT 1');
            console.log(`Database is ready after ${attempt} attempt(s).`);
            return;
        } catch (error) {
            console.log(
                `Database not ready yet (${attempt}/${maxAttempts}): ${error.code || error.message}`
            );

            if (attempt === maxAttempts) {
                throw error;
            }

            await sleep(delayMs);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
}

waitForDatabase().catch((error) => {
    console.error('Database did not become ready in time.');
    console.error(error);
    process.exit(1);
});
