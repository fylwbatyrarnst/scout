const BIN_ID = (import.meta.env.VITE_JSONBIN_BIN_ID || "").trim();
const ACCESS_KEY = (import.meta.env.VITE_JSONBIN_ACCESS_KEY || "").trim();

export const isCloudConfigured = Boolean(
  BIN_ID &&
  ACCESS_KEY &&
  !BIN_ID.includes("YOUR_") &&
  !ACCESS_KEY.includes("YOUR_"),
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

async function parseErrorResponse(res, fallbackPrefix) {
  let detail = "";
  try {
    const text = await res.text();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        detail = parsed?.message || parsed?.error || text;
      } catch {
        detail = text;
      }
    }
  } catch {
    detail = "";
  }

  const cleanDetail = String(detail || "").trim();
  const fullMessage = cleanDetail
    ? `${fallbackPrefix} (${res.status}): ${cleanDetail}`
    : `${fallbackPrefix} (${res.status})`;

  console.error("[cloudStore]", fullMessage, {
    status: res.status,
    binId: BIN_ID ? `${BIN_ID.slice(0, 6)}...` : "missing",
    hasAccessKey: Boolean(ACCESS_KEY),
  });

  return new Error(fullMessage);
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
    throw await parseErrorResponse(res, "فشل جلب البيانات من السحابة");
  }

  const json = await res.json();
  const payload = json?.record?.siteData ? json.record.siteData : json?.record;
  return { configured: true, data: payload || null };
}

export async function saveRemoteSiteData(siteData) {
  if (!isCloudConfigured || !BASE_URL) {
    return { configured: false };
  }

  const payloadBody = JSON.stringify({
    siteData,
    updatedAt: new Date().toISOString(),
  });

  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: buildHeaders(true),
    body: payloadBody,
  });

  if (!res.ok) {
    throw await parseErrorResponse(res, "فشل حفظ التعديلات على السحابة");
  }

  return { configured: true };
}
