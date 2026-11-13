export function compressImageToDataUrl(
  file,
  { maxWidth = 900, maxHeight = 900, quality = 0.65 } = {}
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
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
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

        try {
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (err) {
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