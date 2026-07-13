const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql } = require('drizzle-orm');
const schema = require('./dist/db/schema/legacy/index.js'); // Cannot find module!
// wait, I can just use raw postgres query since drizzle schema failed earlier!
