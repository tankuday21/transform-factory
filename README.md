# Transform Factory

Transform Factory is a modern web application that provides various file conversion tools in one place. Users can convert images, documents, and videos between different formats with ease.

## Features

- **Image Conversion**: Convert between JPG, PNG, BMP, GIF, WEBP, and other formats
- **Document Conversion**: Convert between PDF, Word, Excel, CSV, and other formats
- **Video Conversion**: Convert between MP4, AVI, MOV, WMV, and other formats

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Sharp (image processing)
- pdf-lib, docx, xlsx (document processing)
- FFmpeg (video processing)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/transform-factory.git
   cd transform-factory
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run development server
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Build for Production

```
npm run build
npm run start
```

## Project Structure

```
transform-factory/
├── app/                # Next.js app directory
│   ├── api/            # API routes
│   │   └── convert/    # Conversion API endpoints
│   ├── components/     # Reusable components
│   ├── convert/        # Conversion pages
│   ├── lib/            # Utility functions
│   ├── layout.tsx      # Main layout
│   └── page.tsx        # Homepage
├── public/             # Static assets
└── middleware.ts       # API middleware (CORS, security)
```

## Security Features

- Files are processed on the server and immediately deleted after conversion
- All API requests use secure headers
- CORS protection is implemented
- No tracking or storing of user files

## Maintenance and Updates

### Adding New Converters

1. For new image formats:
   - Add the format to the IMAGE_FORMATS array in `app/convert/image/page.tsx`
   - Implement the conversion logic in `app/api/convert/image/route.ts`

2. For new document formats:
   - Add the format to the DOCUMENT_FORMATS array in `app/convert/document/page.tsx`
   - Implement the conversion logic in `app/api/convert/document/route.ts`

3. For new video formats:
   - Add the format to the VIDEO_FORMATS array in `app/convert/video/page.tsx`
   - Implement the conversion logic in `app/api/convert/video/route.ts`

## Future Improvements

- Batch processing for multiple files
- Premium features (higher resolution, larger file sizes)
- Additional conversion options and settings
- User accounts for saving conversion history
- More advanced conversion algorithms for better quality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Sharp](https://sharp.pixelplumbing.com/) for image processing
- [pdf-lib](https://pdf-lib.js.org/) for PDF manipulation
- [docx](https://docx.js.org/) for Word document processing
- [xlsx](https://sheetjs.com/) for Excel file processing
- [FFmpeg](https://ffmpeg.org/) for video processing 