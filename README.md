# Tilcons Platform

## Overview
This platform has been updated to use **Supabase PostgreSQL** for database operations and **Cloudflare R2** for all file storage.

## Requirements
- Node.js >= 20
- Supabase Project (PostgreSQL)
- Cloudflare R2 Bucket

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Go to Project Settings -> Database and copy the Postgres connection string.
3. Make sure to append `?pgbouncer=true` and use port `6543` for connection pooling.
4. Set the `DATABASE_URL` in your `.env` file.

### 2. Storage Setup (Cloudflare R2)
1. Create a Cloudflare R2 bucket (e.g., `tilcons`).
2. Generate an API token with read and write permissions to the bucket.
3. Copy the Account ID, Access Key ID, and Secret Access Key.
4. Optional: Attach a custom domain to the bucket to make files publicly accessible, and set `CLOUDFLARE_R2_PUBLIC_URL`.
5. Set the required variables in your `.env` file.

### 3. Environment Variables
Copy the `.env.example` file to `.env` and fill in the missing values.
```bash
cp .env.example .env
```

### 4. Database Migration
Run the following command to push the database schema to your Supabase project:
```bash
npm run db:push
```

### 5. Local Development
Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5000`.

## Deployment
For production deployment:
1. Set the correct `NODE_ENV=production` and `APP_URL`.
2. Build the application:
```bash
npm run build
```
3. Start the production server:
```bash
npm start
```
