# File Converter

A comprehensive file conversion application built with Next.js that supports multiple conversion types:

- **Images**: Convert between PNG, JPG, WebP, and more
- **Documents**: Convert between PDF, DOCX, TXT, and more (coming soon)
- **Archives**: Convert between ZIP, RAR, 7Z, and more (coming soon)
- **Audio**: Convert between MP3, WAV, FLAC, and more (coming soon)
- **Video**: Convert between MP4, WebM, AVI, and more (coming soon)

## Features

- Intuitive user interface with step-by-step conversion process
- Drag and drop file uploads
- Batch processing for multiple files
- Preview before conversion
- Detailed conversion stats
- Customizable output settings

## Project Structure

The project is organized around converter types:

```
file-converter/
├── app/
│   ├── components/
│   │   ├── image-converter/       # Image conversion components
│   │   ├── document-converter/    # Document conversion components
│   │   ├── audio-converter/       # Audio conversion components
│   │   ├── video-converter/       # Video conversion components
│   │   ├── archive-converter/     # Archive conversion components
│   │   ├── ui/                    # Shared UI components
│   │   ├── hooks/                 # Shared hooks
│   │   ├── utils/                 # Shared utilities
│   │   ├── layout/                # Layout components
│   │   └── ConvertersUI.tsx       # Main UI component
│   ├── page.tsx                   # Main page
│   └── ...
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui components

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
