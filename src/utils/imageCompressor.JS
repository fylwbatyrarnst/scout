export function compressImageToDataUrl(
  file,
  { maxWidth = 640, maxHeight = 640, initialQuality = 0.5, minQuality = 0.25 } = {}
) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("يرجى اختيار ملف صورة صالح."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("تعذر تهيئة Canvas لمعالجة الصورة."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        let dataUrl = "";

        try {
          dataUrl = canvas.toDataURL("image/jpeg", quality);

          // تقليل الجودة تدريجياً لو حجم الـ DataURL كبير (أكبر من ~45 KB)
          const maxDataUrlChars = 45 * 1024;
          while (dataUrl.length > maxDataUrlChars && quality > minQuality) {
            quality = Math.max(minQuality, Number((quality - 0.1).toFixed(2)));
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(dataUrl);
        } catch {
          reject(new Error("فشل ضغط الصورة."));
        }
      };

      img.onerror = () => {
        reject(new Error("تعذر تحميل الصورة للمعاينة والضغط."));
      };

      img.src = reader.result;
    };

    reader.onerror = () => {
      reject(new Error("تعذر قراءة ملف الصورة من الجهاز."));
    };

    reader.readAsDataURL(file);
  });
}