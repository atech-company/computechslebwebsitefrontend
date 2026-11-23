import { jsonError, jsonOk } from "@/lib/api-response";
import {
  isCampaignAdmin,
  saveCampaignUpload,
} from "@/lib/homepage/campaign-admin";

export async function POST(request: Request) {
  try {
    if (!(await isCampaignAdmin())) {
      return jsonOk({ message: "Sign in required" }, { status: 401 });
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonOk({ message: "Choose an image file" }, { status: 400 });
    }
    const src = await saveCampaignUpload(file);
    return jsonOk({ src });
  } catch (error) {
    return jsonError(error);
  }
}
