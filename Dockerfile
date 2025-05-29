# Dockerfile for Next.js on Google Cloud Run

# ---- Base ----
# Use an official Node.js runtime as a parent image.
# Alpine Linux is used for a smaller image size.
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Dependencies ----
# Install dependencies in a separate layer to leverage Docker's caching.
FROM base AS deps
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies based on the lock file present.
# This project uses npm (implicitly via package.json and its scripts).
RUN npm ci

# ---- Builder ----
# Build the Next.js application.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure NEXT_PUBLIC_ environment variables are available at build time if needed.
# For Cloud Run, runtime environment variables should be configured in the service settings.
# Example: ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
# These can be passed as build arguments to 'docker build' or 'gcloud builds submit'.

RUN npm run build

# ---- Runner ----
# Create the final, minimal image for running the application.
FROM base AS runner
WORKDIR /app

ENV PORT 8080
EXPOSE 8080

# Copy the standalone Next.js output from the builder stage.
# This includes only the necessary files to run the app.
COPY --from=builder /app/.next/standalone ./

# The standalone output includes a server.js file.
# Run the Next.js application using Node.js.
CMD ["node", "server.js"]
