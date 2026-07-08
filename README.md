# FormatWeaver

Fast, simple document conversion — convert images, merge PDFs, extract PDF pages as images, and convert between document formats, right in your browser.

🔗 **Live Demo**: [format-weaver-five.vercel.app](https://format-weaver-five.vercel.app)

---

## Features

- **Image Format Conversion** 
- **PDF Merge** 
- **PDF to Image**
- **Document Conversion** 
- **Secure Login** 
- **Guest Mode**

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Auth**: [NextAuth.js (Auth.js v5)](https://authjs.dev/)
- **Database**: [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **File Processing**: [sharp](https://sharp.pixelplumbing.com/) (images), [pdf-lib](https://pdf-lib.js.org/) (PDF merge), [pdf.js](https://mozilla.github.io/pdf.js/) (PDF rendering)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) Postgres database
- A [Google Cloud](https://console.cloud.google.com/) OAuth client (for Google login)

### Installation

```bash
git clone https://github.com/Laowang886/FormatWeaver.git
cd FormatWeaver
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_neon_connection_string
AUTH_SECRET=your_generated_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Generate `AUTH_SECRET` with:

```bash
npx auth secret
```

### Database Setup

```bash
npx drizzle-kit push
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

This project is deployed on [Vercel](https://vercel.com/). Environment variables must be configured in the Vercel project settings, and the production domain must be added to the Google OAuth **Authorized redirect URIs**:



## License

This project is for personal/educational use.
