// Тип угла (формула 1.19г + учёт ориентации обхода, см. принцип 7)
export function getAngleType(points, i) {
  const n = points.length;
  const a = points[(i - 1 + n) % n];
  const b = points[i];
  const c = points[(i + 1) % n];

  const det = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

  // Поскольку isCCW = true, угол выпуклый, если det > 0
  return det > 0 ? "convex" : "concave";
}

// Биссектриса угла (см. формулу 8)
function computeBisector(p0, p1, p2) {
  const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
  const v2 = [p2[0] - p1[0], p2[1] - p1[1]];

  const len1 = Math.hypot(...v1);
  const len2 = Math.hypot(...v2);
  if (len1 < 1e-6 || len2 < 1e-6) return null;

  const v1Norm = [v1[0] / len1, v1[1] / len1];
  const v2Norm = [v2[0] / len2, v2[1] / len2];

  const bis = [v1Norm[0] + v2Norm[0], v1Norm[1] + v2Norm[1]];
  const lenBis = Math.hypot(...bis);
  if (lenBis < 1e-6) return null;

  return [bis[0] / lenBis, bis[1] / lenBis];
}

// Проверка на коллинеарность (формула 1.20а)
function areCollinear(a, b, c) {
  const area =
    a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]);
  return Math.abs(area) < 1e-6;
}

// Функция для нормализации порядка вершин — гарантирует обход против часовой стрелки
function ensureCCW(points) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    area += p1[0] * p2[1] - p2[0] * p1[1];
  }
  if (area < 0) {
    return points.slice().reverse();
  }
  return points;
}

export function roundPolygonCorners(
  inputPoints,
  radius,
  mode = "all",
  progress = 1
) {
  if (inputPoints.length < 3) return { segments: [], limitedAngles: [] };

  const points = ensureCCW(inputPoints);
  const n = points.length;
  const Ruser = radius * progress;
  const segments = [];
  const limitedAngles = [];
  const corners = [];

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];

    if (areCollinear(p0, p1, p2)) {
      corners.push({ type: "sharp", at: p1 });
      continue;
    }

    const angleType = getAngleType(points, i);
    if (
      (mode === "convex" && angleType !== "convex") ||
      (mode === "concave" && angleType !== "concave")
    ) {
      corners.push({ type: "sharp", at: p1 });
      continue;
    }

    const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const len1 = Math.hypot(...v1);
    const len2 = Math.hypot(...v2);

    if (len1 < 1e-6 || len2 < 1e-6) {
      corners.push({ type: "sharp", at: p1 });
      continue;
    }

    const v1Norm = [v1[0] / len1, v1[1] / len1];
    const v2Norm = [v2[0] / len2, v2[1] / len2];

    const bisector = computeBisector(p0, p1, p2);
    if (!bisector) {
      corners.push({ type: "sharp", at: p1 });
      continue;
    }

    const dot = v1Norm[0] * v2Norm[0] + v1Norm[1] * v2Norm[1];
    const angle = Math.acos(Math.min(Math.max(dot, -1), 1));

    const cross = v1Norm[0] * v2Norm[1] - v1Norm[1] * v2Norm[0];
    const isConvex = cross > 0;

    const maxR = Math.min(len1, len2) * Math.tan(angle / 2);
    const r = Math.min(Ruser, maxR);

    if (r < Ruser - 1e-3) limitedAngles.push(i);
    if (r < 1e-3) {
      corners.push({ type: "sharp", at: p1 });
      continue;
    }

    const h = r / Math.sin(angle / 2);
    const normalDir = isConvex ? -1 : 1;
    const center = [
      p1[0] + bisector[0] * h * normalDir,
      p1[1] + bisector[1] * h * normalDir,
    ];

    const pStart = [p1[0] + v1Norm[0] * r, p1[1] + v1Norm[1] * r];
    const pEnd = [p1[0] + v2Norm[0] * r, p1[1] + v2Norm[1] * r];

    const startAngle = Math.atan2(pStart[1] - center[1], pStart[0] - center[0]);
    const endAngle = Math.atan2(pEnd[1] - center[1], pEnd[0] - center[0]);

    const anticlockwise = isConvex ? false : true;

    corners.push({
      type: "arc",
      pStart,
      pEnd,
      center,
      radius: r,
      startAngle,
      endAngle,
      anticlockwise,
    });
  }

  for (let i = 0; i < n; i++) {
    const prev = corners[(i - 1 + n) % n];
    const curr = corners[i];
    const from = prev.type === "arc" ? prev.pEnd : prev.at;
    const to = curr.type === "arc" ? curr.pStart : curr.at;

    if (i === 0) segments.push({ type: "M", to });
    else segments.push({ type: "L", to });

    if (curr.type === "arc") {
      segments.push({
        type: "A",
        to: curr.pEnd,
        center: curr.center,
        radius: curr.radius,
        startAngle: curr.startAngle,
        endAngle: curr.endAngle,
        anticlockwise: curr.anticlockwise,
      });
    }
  }

  segments.push({ type: "Z" });
  return { segments, limitedAngles };
}
