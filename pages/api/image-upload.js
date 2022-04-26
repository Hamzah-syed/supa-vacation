import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { decode } from "base64-arraybuffer";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { image } = req.body;
      if (!image) {
        return res.status(500).json({ message: "No image provided" });
      } else {
        const contentType = image.match(/data:(.*);base64/)?.[1];
        const base64FileData = image.split("base64,")?.[1];
        // Check if its base64 image
        if (!contentType || !base64FileData) {
          return res.status(500).json({ message: "Image data not valid" });
        } else {
          // File data
          const fileName = nanoid();
          const ext = contentType.split("/")[1];
          const path = `${fileName}.${ext}`;

          // Now decode the Base64 data, use the base64-arraybuffer
          const { data, error: uploadError } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(path, decode(base64FileData), {
              contentType,
              upsert: true,
            });

          if (uploadError) {
            throw new Error("Unable to upload image to storage");
          }
          // Create URL
          const url = `${process.env.SUPABASE_URL.replace(
            ".co",
            ".in"
          )}/storage/v1/object/public/${data.Key}`;
          return res.status(200).json({ url });
        }
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res
        .status(405)
        .json({ message: `HTTP method ${req.method} is not supported.` });
    }
  } catch (error) {
    res.status(500).json({ message: `somehting went wrong` });
  }
}
