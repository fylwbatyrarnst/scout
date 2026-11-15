import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
const STORAGE_BUCKET = "rover-media";
const CONFIG_ROW_ID = "main";
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const isCloudConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("YOUR_") &&
    !SUPABASE_ANON_KEY.includes("YOUR_")
);

export const supabase = isCloudConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function sanitizeImageUrl(url) {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/")) {
    return trimmed.startsWith("//") ? "" : trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

export async function signInAdmin(email, password) {
  if (!isCloudConfigured || !supabase) {
    throw new Error("إعدادات Supabase غير مكتملة في متغيرات البيئة.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || "").trim(),
    password: String(password || ""),
  });

  if (error) {
    throw new Error("بيانات الدخول غير صحيحة أو الحساب غير مفعل.");
  }

  return data.user;
}

export async function signOutAdmin() {
  if (!isCloudConfigured || !supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  if (!isCloudConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export function onAuthStateChange(callback) {
  if (!isCloudConfigured || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

export async function fetchRemoteSiteData() {
  if (!isCloudConfigured || !supabase) {
    return { configured: false, data: null };
  }

  const { data, error } = await supabase
    .from("site_config")
    .select("site_data")
    .eq("id", CONFIG_ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`تعذر جلب بيانات الموقع: ${error.message}`);
  }

  if (!data) {
    return { configured: true, data: null, isEmpty: true };
  }

  const payload = data.site_data;
  const isEmpty =
    !payload ||
    (typeof payload === "object" && Object.keys(payload).length === 0);

  return {
    configured: true,
    data: isEmpty ? null : payload,
    isEmpty,
  };
}

export async function saveRemoteSiteData(siteData) {
  if (!isCloudConfigured || !supabase) {
    return { configured: false };
  }

  const { error } = await supabase.from("site_config").upsert(
    {
      id: CONFIG_ROW_ID,
      site_data: siteData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`تعذر حفظ التعديلات: ${error.message}`);
  }

  return { configured: true };
}

export async function uploadImageToCloud(file, folder = "general") {
  if (!isCloudConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  if (!file || !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("يُسمح فقط بملفات الصور بصيغة JPG أو PNG أو WEBP أو GIF.");
  }

  const extMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = extMap[file.type] || "jpg";
  const safeFolder = String(folder || "general").replace(/[^a-zA-Z0-9_-]/g, "");
  const filePath = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`فشل رفع الصورة: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  const safeUrl = sanitizeImageUrl(data?.publicUrl || "");
  if (!safeUrl) {
    throw new Error("تعذر التحقق من رابط الصورة بعد الرفع.");
  }

  return safeUrl;
}

export async function submitJoinRequestRemote(reqData) {
  if (!isCloudConfigured || !supabase) {
    throw new Error("تعذر إرسال الطلب لعدم تفعيل الاتصال السحابي.");
  }

  const payload = {
    name: String(reqData?.name || "").trim().slice(0, 120),
    year: String(reqData?.year || "").trim().slice(0, 60),
    phone: String(reqData?.phone || "").trim().slice(0, 25),
    committee: String(reqData?.committee || "").trim().slice(0, 100),
    status: "جديد",
  };

  if (!payload.name || !payload.year || !payload.phone || !payload.committee) {
    throw new Error("يرجى استكمال جميع بيانات طلب الانضمام.");
  }

  const { data, error } = await supabase
    .from("join_requests")
    .insert(payload)
    .select("id, name, year, phone, committee, status, created_at")
    .single();

  if (error) {
    throw new Error(`فشل إرسال الطلب: ${error.message}`);
  }

  return data;
}

export async function fetchJoinRequestsRemote() {
  if (!isCloudConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("join_requests")
    .select("id, name, year, phone, committee, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`تعذر جلب طلبات الانضمام: ${error.message}`);
  }

  return Array.isArray(data) ? data : [];
}

export async function updateJoinRequestStatusRemote(id, status) {
  if (!isCloudConfigured || !supabase) return;

  const allowedStatuses = new Set(["جديد", "تم التواصل", "مقبول"]);
  const nextStatus = allowedStatuses.has(status) ? status : "جديد";

  const { error } = await supabase
    .from("join_requests")
    .update({ status: nextStatus })
    .eq("id", id);

  if (error) {
    throw new Error(`تعذر تحديث حالة الطلب: ${error.message}`);
  }
}