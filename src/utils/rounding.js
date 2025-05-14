// Определение типа угла (выпуклый/вогнутый)
export function getAngleType(points, i) {
  const n = points.length;
  const a = points[(i - 1 + n) % n];
  const b = points[i];
  const c = points[(i + 1) % n];

  const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  return cross > 0 ? "convex" : "concave";
}

// Вычисление расстояния между точками
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
}

// Нормализация вектора
function normalize(vector) {
  const len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
  return [vector[0] / len, vector[1] / len];
}

// Вычисление точки на расстоянии от начала отрезка
function getPointAtDistance(start, end, distance) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  const t = distance / len;
  return [
    start[0] + dx * t,
    start[1] + dy * t
  ];
}

// Вычисление перпендикулярного вектора
function getPerpendicular(vector) {
  return [-vector[1], vector[0]];
}

export function roundPolygonCorners(points, radius, type = "all", progress = 1) {
  if (points.length < 3) return [];

  const rounded = [];
  const n = points.length;
  const effectiveRadius = radius * progress;

  for (let i = 0; i < n; i++) {
    const a = points[(i - 1 + n) % n];
    const b = points[i];
    const c = points[(i + 1) % n];

    const angleType = getAngleType(points, i);
    if ((type === "convex" && angleType !== "convex") ||
      (type === "concave" && angleType !== "concave")) {
      rounded.push(b);
      continue;
    }

    const ab = normalize([a[0] - b[0], a[1] - b[1]]);
    const cb = normalize([c[0] - b[0], c[1] - b[1]]);

    const distToA = distance(a, b);
    const distToC = distance(c, b);
    const maxRadius = Math.min(distToA, distToC) * 0.45;
    const actualRadius = Math.min(effectiveRadius, maxRadius);

    const p1 = [b[0] + ab[0] * actualRadius, b[1] + ab[1] * actualRadius];
    const p2 = [b[0] + cb[0] * actualRadius, b[1] + cb[1] * actualRadius];

    const k = 0.552284749831;
    const controlDist = actualRadius * k;

    const cp1 = [p1[0] - ab[0] * controlDist, p1[1] - ab[1] * controlDist];
    const cp2 = [p2[0] - cb[0] * controlDist, p2[1] - cb[1] * controlDist];

    // Добавляем линию от предыдущего скругления к началу текущего
    if (i === 0) {
      rounded.push(p1);
    } else {
      rounded.push(p1);
    }

    // Добавляем кривую Безье
    rounded.push(cp1);
    rounded.push(cp2);
    rounded.push(p2);
  }

  // Замыкаем последнюю точку на первую
  if (rounded.length > 0) {
    rounded.push(rounded[0]);
  }

  return rounded;
}

