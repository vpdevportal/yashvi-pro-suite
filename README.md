# Batch Watermark Tool

A desktop application built with Electron, React, and Sharp for batch watermarking images with a logo.

## Features

- ✅ Select multiple images at once
- ✅ Choose a logo to use as watermark
- ✅ Batch process all images
- ✅ Customizable watermark options:
  - Position (top-left, top-right, bottom-left, bottom-right, center)
  - Logo size (percentage of image)
  - Opacity (transparency level)
  - Margin (distance from edges)
- ✅ Real-time progress tracking
- ✅ Beautiful, modern UI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the project directory:
```bash
cd yashvi-pro-suite
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the app in development mode:

```bash
npm run dev
```

This will:
- Start the React development server
- Launch Electron with hot-reload

On macOS, you can also use the helper script (it sets `BROWSER=none` so no browser tab opens):

```bash
./start.sh
```

## Production Build

To build the React app:

```bash
npm run build
```

To run the built app:

```bash
npm start
```

To create a distributable package:

```bash
npm run build:electron
```

## Usage

1. **Select Images**: Click "Choose Images" to select one or more images to watermark
2. **Select Logo**: Click "Choose Logo" to select your watermark logo
3. **Choose Output Folder**: Select where you want the watermarked images to be saved
4. **Adjust Options** (optional):
   - Set watermark position
   - Adjust logo size (5-50% of image)
   - Set opacity (10-100%)
   - Set margin (0-10%)
5. **Process**: Click "Process Images" to start batch watermarking
6. **Wait**: Monitor progress in the progress bar
7. **Done**: Check the output folder for your watermarked images (saved as `originalname_watermarked.ext`)

## Supported Image Formats

- Input Images: JPG, JPEG, PNG, WebP, GIF, BMP, TIFF
- Logo: JPG, JPEG, PNG, WebP, GIF, BMP, SVG

## Tech Stack

- **Electron**: Desktop application framework
- **React**: UI library
- **Sharp**: High-performance image processing
- **Node.js**: Runtime environment

## License

MIT

## Notes

- The app preserves the original image format
- Watermarked images are saved with `_watermarked` suffix
- Large batches may take some time to process
- Make sure you have sufficient disk space for output images
