// CORS when consuming Medusa from admin
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DB_USERNAME = process.env.DB_USERNAME || "cedcoss";
const DB_PASSWORD = process.env.DB_PASSWORD || "";

// Database URL (here we use a local database called medusa-development)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgres://${DB_USERNAME}:${DB_PASSWORD}@localhost/medusa`;

console.log(DATABASE_URL);

// Medusa uses Redis, so this needs configuration as well
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Stripe keys
const STRIPE_API_KEY = process.env.STRIPE_API_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// This is the place to include plugins. See API documentation for a thorough guide on plugins.
const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `medusa-payment-stripe`,
    options: {
      api_key:
        "sk_test_51K30J5EWurMEV1EMUDIl1zk69t0ZcA5cOYTZ0opSHmlLxX3ysnlbve8z8MIEfn5mf29rZQ9YcSdcEwTrLySJgdiA00WE4EgfSG",
      webhook_secret: "we_1K30LnEWurMEV1EM899EdORa",
    },
  },
];

module.exports = {
  projectConfig: {
    redis_url: REDIS_URL,
    // For more production-like environment install PostgresQL
    database_url: DATABASE_URL,
    database_type: "postgres",
    // database_database: "./medusa-db.sql",
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
  },
  plugins,
};
