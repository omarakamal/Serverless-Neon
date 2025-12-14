import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Where Drizzle looks for your schema files:
  schema: "./netlify/db/schema",
  
  // Database dialect:
  dialect: "postgresql",

  // Database connection string:
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // Where migration SQL files will be written:
  out: "./drizzle",
});
