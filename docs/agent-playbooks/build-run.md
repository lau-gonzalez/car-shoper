# Build & Run Playbook — car-shoper

## Prerequisites

- Node.js (LTS)
- pnpm (`npm install -g pnpm`)

## Install dependencies

```sh
pnpm install
```

## Build

```sh
pnpm run build
```

## Run locally (development)

```sh
pnpm run dev
```

## Environment variables

Create a `.env` file at the project root (not committed to git). Required variables will be documented here as they are introduced.

## Package manager

This project uses **pnpm** exclusively. Do not use `npm` or `yarn` for dependency management. All scripts should be invoked via `pnpm run <script>` or `pnpm <command>`.

## Project structure

car-shoper is a multi-tenant SaaS platform for car dealerships. The architecture supports:

- **Seller portal (CMS)**: Authenticated area where car agency staff manage inventory (CRUD cars), configure their storefront, and view customer inquiries.
- **Public storefront**: Customer-facing pages for browsing car listings, viewing details, and contacting the seller. Each agency gets its own branded storefront.
- **Platform admin**: Internal tooling for managing agency accounts, subscriptions, and platform-wide settings.

Specific file paths and structure will evolve as the project is built out.
