# Nishkigram

Nishkigram is a web platform focused on places, recommendations, and local content from Niš, Serbia. I built the project as a way to work on a real-world Next.js application, from the public website and content management to deployment and administration.

**Live website:** https://nishkigram.com/

## About

The idea behind Nishkigram is to have one place for discovering interesting locations and content related to Niš.

The project includes the public-facing website as well as a private admin area that I use to manage recommendations, blog posts, categories, and uploaded images.

The application is deployed on Vercel and connected to GitHub for deployment from the main branch.

## Features

* Local recommendations with categories
* Blog and content management
* Responsive layout for desktop and mobile
* Private admin panel
* Creating, editing, and deleting content through the admin panel
* Image upload and management
* Server-side admin authentication
* Protected admin API routes
* Login rate limiting
* Production deployment with a custom domain

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Vercel
* Vercel Blob

## Admin and Security

The admin section is not publicly accessible without authentication. Admin authentication and protected operations are handled on the server.

The project uses HTTP-only cookies, signed sessions with expiration, CSRF protection for state-changing admin requests, protected API routes, and rate limiting for login attempts.

Uploaded images are also validated on the server before being stored.

Sensitive configuration such as passwords and secrets is kept in environment variables and is not stored in the repository.

## Screenshots

### Home

![Nishkigram Home](docs/home.png)

### Recommendations

![Nishkigram Recommendations](docs/recommendations.png)

### Blog

![Nishkigram Blog](docs/blog.png)

## Running Locally

Clone the repository:

```bash
git clone https://github.com/MiticAndrija/nishkigram.git
```

Open the project:

```bash
cd nishkigram
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

Some functionality requires environment variables that are configured separately and are not included in the repository.

## Deployment

Nishkigram is deployed on Vercel. Changes pushed to the main branch are deployed to the production environment.

**Production:** https://nishkigram.com/

## Author

**Andrija Mitić**

[GitHub](https://github.com/MiticAndrija)
[LinkedIn](https://www.linkedin.com/in/andrija-mitic/)
