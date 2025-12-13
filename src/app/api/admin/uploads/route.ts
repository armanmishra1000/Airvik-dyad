import { NextResponse } from "next/server";

import { createSessionClient } from "@/integrations/supabase/server";
import { getServerProfile } from "@/lib/server/page-auth";
import { uploadToImagesBucket } from "@/lib/server/storage";

const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function POST(request: Request) {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized;
  }

  const profile = await getServerProfile();

  if (!profile) {
    return unauthorized;
  }

  const hasSettingPermission = profile.permissions.includes("update:setting");

  if (!hasSettingPermission) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const rawFile = formData.get("file");

  if (!rawFile || !(rawFile instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!rawFile.type?.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  try {
    const url = await uploadToImagesBucket(rawFile, { prefix: "event-banners" });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
