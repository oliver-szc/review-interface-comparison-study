# Review Study Platform

## Subject: Interface Comparison Study
Master's thesis: Comparing three consumer review interfaces (unassisted, ABSA dashboard, chatbot). Built with Next.js. Includes user study platform with tracking, surveys, and sentiment-annotated Amazon product reviews.


## Setup Instructions

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Add your `DATABASE_URL` from Vercel Postgres
5. Run development server: `npm run dev`
6. Visit `http://localhost:3000`

## Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - Reusable React components
- `/src/db` - Database schema and queries
- `/src/lib` - Utility functions
- `/src/hooks` - Custom React hooks

## Database Migrations

- Run: `npx drizzle-kit push:pg`

## Test Database Connection

- Visit: `http://localhost:3000/api/test-db`