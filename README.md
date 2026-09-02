# Nishkigram

Nishkigram is a local media website for stories, city guides, and recommendations from Niš. It includes searchable public content and a password-protected admin area for managing posts, recommendations, categories, and uploaded images.

**Live Demo:** https://nishkigram.com/

## Features

* Blog posts and local recommendations with dedicated detail pages
* Search and category filtering
* Responsive design for desktop and mobile devices
* Password-protected admin dashboard
* Create, edit, publish, unpublish, and delete content
* Rich-text editing with links, images, and YouTube embeds
* Blog and recommendation category management
* Image uploads with format, size, and file-signature validation
* Media library with usage tracking and deletion controls
* JSON-based content storage with GitHub-backed updates in production
* Optional Vercel Blob storage and Google Analytics

## Tech Stack

* **Application:** Next.js 16 App Router, React 19, TypeScript
* **Styling:** Tailwind CSS 4, PostCSS
* **Animation:** Motion
* **Content storage:** Local JSON files in development, GitHub Contents API in production
* **Media storage:** Local filesystem in development, Vercel Blob when configured
* **Tooling:** npm, ESLint 9, Next.js Core Web Vitals rules

## Project Structure

```text
app/
├── api/admin/             # Authenticated content and upload endpoints
├── admin/                 # Blog, recommendation, and media management
├── blog/                  # Blog listing and article pages
├── preporuke/             # Recommendation listing and detail pages
├── o-nama/                # About page
├── layout.tsx             # Root layout, fonts, footer, and analytics
└── page.tsx               # Home page
components/                # Public UI and admin editors/managers
data/                      # Posts, recommendations, and category JSON files
lib/                       # Auth, content, GitHub, upload, and sanitization logic
public/images/             # Static site imagery
```

The public pages read published records from the JSON files. Admin API routes validate the signed session, sanitize submitted HTML, and write updated JSON locally or through the GitHub Contents API. Uploaded images use `public/uploads/blog` locally and Vercel Blob in a configured deployment.

## Getting Started

### Prerequisites

* Node.js 20.9 or newer
* npm

### Installation

```bash
git clone https://github.com/MiticAndrija/nishkigram.git
cd nishkigram
npm ci
```

Create `.env.local` if you want to use the admin area. See [Configuration](#configuration) for the available variables.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000. The admin login is available at http://localhost:3000/admin/login.

To create and run a production build:

```bash
npm run build
npm start
```

## Configuration

The public site can run from the committed data without environment variables. Configure the following values to enable the admin area and production storage features:

```dotenv
# Required for admin authentication
ADMIN_PASSWORD=choose-a-password
ADMIN_SESSION_SECRET=generate-a-long-random-secret

# Required for GitHub-backed content updates in production
GITHUB_TOKEN=github-token-with-contents-write-access
GITHUB_REPO=MiticAndrija/nishkigram
GITHUB_BRANCH=main

# Optional: Vercel Blob storage
BLOB_READ_WRITE_TOKEN=vercel-blob-read-write-token

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

`GITHUB_BRANCH` defaults to `main`. If GitHub integration is not configured, admin changes are written to the local `data` directory. If Vercel Blob is not configured, uploaded images are stored locally in `public/uploads/blog`.

Never commit `.env.local` or production credentials.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm start        # Run the production server
npm run lint     # Run ESLint
```

## Author

Andrija Mitić

LinkedIn: [linkedin.com/in/andrija-mitic](https://www.linkedin.com/in/andrija-mitic/)

GitHub: [github.com/MiticAndrija](https://github.com/MiticAndrija)
