/**
 * Utility to generate watermarked preview images using Canvas API
 */

/**
 * Calculate logo position based on watermark options
 */
const calculateLogoPosition = (imageWidth, imageHeight, logoWidth, logoHeight, options) => {
  const margin = Math.min(imageWidth, imageHeight) * (options.margin / 100);
  let top, left;

  switch (options.position) {
    case 'top-left':
      top = margin;
      left = margin;
      break;
    case 'top-right':
      top = margin;
      left = imageWidth - logoWidth - margin;
      break;
    case 'bottom-left':
      top = imageHeight - logoHeight - margin;
      left = margin;
      break;
    case 'bottom-right':
      top = imageHeight - logoHeight - margin;
      left = imageWidth - logoWidth - margin;
      break;
    case 'center':
      top = (imageHeight - logoHeight) / 2;
      left = (imageWidth - logoWidth) / 2;
      break;
    default:
      top = margin;
      left = margin;
  }

  return { top, left };
};

/**
 * Generate a watermarked preview image
 * @param {string} imageDataUrl - Base64 data URL of the image thumbnail
 * @param {string} logoDataUrl - Base64 data URL of the logo
 * @param {object} options - Watermark options (position, logoSize, opacity, margin)
 * @returns {Promise<string>} - Base64 data URL of the watermarked preview
 */
export const generateWatermarkedPreview = async (imageDataUrl, logoDataUrl, options) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const logo = new Image();

      let imagesLoaded = 0;
      const onImageLoad = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image
            ctx.drawImage(img, 0, 0);

            // Calculate logo size (percentage of image dimensions)
            const logoWidth = Math.floor(img.width * (options.logoSize / 100));
            const logoHeight = Math.floor(img.height * (options.logoSize / 100));

            // Resize logo maintaining aspect ratio
            const logoAspectRatio = logo.width / logo.height;
            let finalLogoWidth = logoWidth;
            let finalLogoHeight = logoHeight;

            if (logoAspectRatio > 1) {
              // Logo is wider
              finalLogoHeight = logoWidth / logoAspectRatio;
              if (finalLogoHeight > logoHeight) {
                finalLogoHeight = logoHeight;
                finalLogoWidth = logoHeight * logoAspectRatio;
              }
            } else {
              // Logo is taller
              finalLogoWidth = logoHeight * logoAspectRatio;
              if (finalLogoWidth > logoWidth) {
                finalLogoWidth = logoWidth;
                finalLogoHeight = logoWidth / logoAspectRatio;
              }
            }

            // Calculate position
            const { top, left } = calculateLogoPosition(
              img.width,
              img.height,
              finalLogoWidth,
              finalLogoHeight,
              options
            );

            // Apply opacity
            ctx.globalAlpha = options.opacity / 100;

            // Draw the logo
            ctx.drawImage(
              logo,
              Math.max(0, left),
              Math.max(0, top),
              finalLogoWidth,
              finalLogoHeight
            );

            // Reset alpha
            ctx.globalAlpha = 1.0;

            // Convert to data URL
            const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve(previewDataUrl);
          } catch (error) {
            reject(error);
          }
        }
      };

      img.onload = onImageLoad;
      img.onerror = () => reject(new Error('Failed to load image'));
      logo.onload = onImageLoad;
      logo.onerror = () => reject(new Error('Failed to load logo'));

      img.src = imageDataUrl;
      logo.src = logoDataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

