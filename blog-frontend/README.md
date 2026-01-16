# Blog Frontend - Next.js

A minimal modern blog frontend built with Next.js 14 and shadcn/ui.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form + Zod
- React Quill (editor)
- Axios

## Design

- **Style**: Minimal Modern
- **Background**: `#FFFFFF` / `#FAFAFA`
- **Text**: `#111827` / `#1F2937`
- **Primary**: Blue `#2563EB`
- **Font**: Inter

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd blog-frontend
npm install
```

### Configuration

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/               # Login, Register
│   ├── posts/              # Post pages
│   ├── categories/         # Category pages
│   ├── tags/               # Tag pages
│   ├── admin/              # Admin dashboard
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, Footer
│   └── post/               # Post components
├── lib/
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth helpers
│   └── utils.ts            # Utilities
└── types/                  # TypeScript types
```

## Features

- ✅ User authentication (Login/Register)
- ✅ Post listing with pagination
- ✅ Post search
- ✅ Create/Edit/Delete posts
- ✅ Rich text editor
- ✅ Categories & Tags
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Loading states
- ✅ Toast notifications
