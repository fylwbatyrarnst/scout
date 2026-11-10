const BIN_ID = (import.meta.env.VITE_JSONBIN_BIN_ID || "").trim();
const ACCESS_KEY = (import.meta.env.VITE_JSONBIN_ACCESS_KEY || "").trim();

export const isCloudConfigured = Boolean(
  BIN_ID &&
    ACCESS_KEY &&
    !BIN_ID.includes("YOUR_") &&
    !ACCESS_KEY.includes("YOUR_")
);

const BASE_URL = BIN_ID ? `https://api.jsonbin.io/v3/b/${BIN_ID}` : "";

function buildHeaders(includeJson = false) {
  const headers = {
    "X-Access-Key": ACCESS_KEY,
  };
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

export async function fetchRemoteSiteData() {
  if (!isCloudConfigured || !BASE_URL) {
    return { configured: false, data: null };
  }

  const res = await fetch(`${BASE_URL}/latest`, {
    method: "GET",
    headers: buildHeaders(false),
  });

  if (!res.ok) {
    throw new Error(`فشل جلب البيانات من السحابة (${res.status})`);
  }

  const json = await res.json();
  const payload = json?.record?.siteData ? json.record.siteData : json?.record;
  return { configured: true, data: payload || null };
}

export async function saveRemoteSiteData(siteData) {
  if (!isCloudConfigured || !BASE_URL) {
    return { configured: false };
  }

  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify({
      siteData,
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error(`فشل حفظ التعديلات على السحابة (${res.status})`);
  }

  return { configured: true };
}
