import express from 'express';
import ogs from 'open-graph-scraper';
import { LinkPreview } from '@support-portal/shared';

const router = express.Router();

// POST /api/links/preview - Fetch link preview metadata
router.post('/preview', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const { result } = await ogs({ url });

    const preview: LinkPreview = {
      url,
      title: result.ogTitle || result.twitterTitle,
      description: result.ogDescription || result.twitterDescription,
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
      siteName: result.ogSiteName,
    };

    return res.json(preview);
  } catch (error) {
    console.error('Link preview error:', error);
    return res.status(500).json({ error: 'Failed to fetch link preview' });
  }
});

export default router;
