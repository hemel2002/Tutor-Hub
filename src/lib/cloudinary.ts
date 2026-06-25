/**
 * cloudinary.ts - Tutor-Hub Media & File Upload Adapter
 * 
 * This file handles file and media uploads. By default, it generates local
 * object URLs so that uploaded images/avatars render instantly in the browser.
 * 
 * To connect to Cloudinary later:
 * 1. Install the Cloudinary SDK: npm install cloudinary
 * 2. Set environment variables in .env.local:
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 * 3. Uncomment/add server-side API routes that use Cloudinary uploader to upload files.
 */

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

export const cloudinary = {
  /**
   * Simulates uploading a file.
   * Returns a local blob URL that can be rendered in the browser instantly.
   */
  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      bytes: result.bytes
    };
  },

  /**
   * Mock audio waveform generator for dispute audio files
   */
  generateMockWaveform(barsCount: number = 40): number[] {
    const bars: number[] = [];
    for (let i = 0; i < barsCount; i++) {
      // Create random bar heights representing an audio waveform (value between 10 and 100)
      const baseHeight = Math.sin((i / barsCount) * Math.PI * 4) * 40 + 50;
      const noise = Math.random() * 20 - 10;
      bars.push(Math.max(15, Math.min(100, Math.round(baseHeight + noise))));
    }
    return bars;
  }
};
