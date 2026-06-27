/**
 * 画像の四隅から連続する白背景のみを透過処理（ラベルの白は保持）
 */
export function removeWhiteBackground(
  src: string,
  threshold = 220
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      const isWhite = (i: number) =>
        data[i] > threshold && data[i + 1] > threshold && data[i + 2] > threshold;

      // 四隅からのフラッドフィル（BFS）
      const visited = new Uint8Array(w * h);
      const queue: number[] = [];

      const enqueue = (x: number, y: number) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const idx = y * w + x;
        if (visited[idx]) return;
        const pi = idx * 4;
        if (!isWhite(pi)) return;
        visited[idx] = 1;
        queue.push(x, y);
      };

      // 四辺のピクセルをシードとして追加
      for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h - 1); }
      for (let y = 0; y < h; y++) { enqueue(0, y); enqueue(w - 1, y); }

      while (queue.length > 0) {
        const y = queue.pop()!;
        const x = queue.pop()!;
        const pi = (y * w + x) * 4;

        // 境界を滑らかにするためalphaを段階的に
        const brightness = Math.min(data[pi], data[pi + 1], data[pi + 2]);
        const alpha = Math.round(255 * (1 - (brightness - threshold) / (255 - threshold)));
        data[pi + 3] = Math.max(0, Math.min(alpha, data[pi + 3]));

        enqueue(x + 1, y);
        enqueue(x - 1, y);
        enqueue(x, y + 1);
        enqueue(x, y - 1);
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = src;
  });
}
