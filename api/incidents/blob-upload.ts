import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthenticated } from "../../server/lib/auth.js";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

/** 10 MiB per file */
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!(await isAuthenticated(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    res.status(503).json({ error: "Blob storage not configured" });
    return;
  }

  try {
    const raw =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const body = raw as HandleUploadBody;

    const jsonResponse = await handleUpload({
      token,
      request: req,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_SIZE_BYTES,
        addRandomSuffix: true,
      }),
    });

    res.status(200).json(jsonResponse);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Upload request invalid or failed" });
  }
}
