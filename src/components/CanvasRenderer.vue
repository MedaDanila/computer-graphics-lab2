<script setup>
import { onMounted, ref, watch, computed } from "vue";

// Пропсы и эвенты
const props = defineProps({
  points: Array,
  roundedPath: Array,
  radius: Number,
  roundingType: String,
  isPolygonComplete: Boolean,
});
const emit = defineEmits(["add-point", "update-point", "complete-polygon"]);

// Локальное состояние рисования
const canvasRef = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);
const currentPoint = ref(null);
const draggingPointIndex = ref(null);

onMounted(() => {
  ctx.value = canvasRef.value.getContext("2d");
  draw();
});

// Следим за изменениями точек и скруглений
watch(
  () => [
    props.points.length,
    props.roundedPath.length,
    props.isPolygonComplete,
  ],
  () => draw()
);

// Основная функция отрисовки
const draw = () => {
  if (!ctx.value) return;
  const canvas = canvasRef.value;
  ctx.value.clearRect(0, 0, canvas.width, canvas.height);

  // Сетка
  ctx.value.save();
  ctx.value.strokeStyle = '#e5e7eb';
  ctx.value.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 20) {
    ctx.value.beginPath();
    ctx.value.moveTo(x, 0);
    ctx.value.lineTo(x, canvas.height);
    ctx.value.stroke();
  }
  for (let y = 0; y < canvas.height; y += 20) {
    ctx.value.beginPath();
    ctx.value.moveTo(0, y);
    ctx.value.lineTo(canvas.width, y);
    ctx.value.stroke();
  }
  ctx.value.restore();

  // Оригинальный полигон
  if (props.points.length > 0) {
    ctx.value.beginPath();
    ctx.value.moveTo(props.points[0].x, props.points[0].y);
    for (let i = 1; i < props.points.length; i++) {
      ctx.value.lineTo(props.points[i].x, props.points[i].y);
    }
    if (props.isPolygonComplete) ctx.value.closePath();
    ctx.value.strokeStyle = "#3b82f6";
    ctx.value.lineWidth = 2;
    ctx.value.stroke();
  }

  // Скруглённый полигон
  if (props.isPolygonComplete && props.roundedPath.length > 0) {
    ctx.value.beginPath();
    
    // Начинаем с первой точки
    const firstPoint = props.roundedPath[0];
    ctx.value.moveTo(firstPoint[0], firstPoint[1]);
    
    // Отрисовываем кривые Безье
    for (let i = 1; i < props.roundedPath.length; i += 3) {
      const cp1 = props.roundedPath[i];
      const cp2 = props.roundedPath[i + 1];
      const end = props.roundedPath[i + 2];
      
      if (cp1 && cp2 && end) {
        ctx.value.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], end[0], end[1]);
      }
    }
    
    ctx.value.closePath();
    ctx.value.strokeStyle = "#ef4444";
    ctx.value.lineWidth = 3;
    ctx.value.stroke();
    ctx.value.fillStyle = "rgba(239,68,68,0.1)";
    ctx.value.fill();

    // Отображаем точки скругления и контрольные точки (для отладки)
    if (false) { // Установите в true для отладки
      ctx.value.fillStyle = "#00ff00";
      for (let i = 0; i < props.roundedPath.length; i++) {
        const point = props.roundedPath[i];
        ctx.value.beginPath();
        ctx.value.arc(point[0], point[1], 3, 0, Math.PI * 2);
        ctx.value.fill();
      }
    }
  }

  // Точки вершин
  props.points.forEach((pt, index) => {
    ctx.value.beginPath();
    ctx.value.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
    if (badVertexIndices.value.includes(index)) {
      ctx.value.strokeStyle = '#dc2626';
      ctx.value.lineWidth = 2;
      ctx.value.fillStyle = '#fff';
      ctx.value.fill();
      ctx.value.stroke();
    } else {
      ctx.value.fillStyle = "#3b82f6";
      ctx.value.fill();
      ctx.value.strokeStyle = "white";
      ctx.value.lineWidth = 2;
      ctx.value.stroke();
    }
    // Номера вершин
    ctx.value.font = "12px Arial";
    ctx.value.fillStyle = "black";
    ctx.value.textAlign = "center";
    ctx.value.textBaseline = "middle";
    ctx.value.fillText((index + 1).toString(), pt.x, pt.y);
  });

  // Во время рисования нового ребра
  if (isDrawing.value && currentPoint.value && !props.isPolygonComplete) {
    const last = props.points[props.points.length - 1];
    ctx.value.beginPath();
    ctx.value.moveTo(last.x, last.y);
    ctx.value.lineTo(currentPoint.value.x, currentPoint.value.y);
    ctx.value.strokeStyle = "#9ca3af";
    ctx.value.setLineDash([5, 3]);
    ctx.value.stroke();
    ctx.value.setLineDash([]);

    // Предварительный просмотр новой точки
    ctx.value.beginPath();
    ctx.value.arc(currentPoint.value.x, currentPoint.value.y, 6, 0, Math.PI * 2);
    ctx.value.fillStyle = "rgba(59, 130, 246, 0.5)";
    ctx.value.fill();
  }
};

// Помощники для мыши
const getMousePos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};

// Обработчики событий
const onMouseDown = (e) => {
  const pos = getMousePos(e);
  
  // ПКМ — закрытие полигона
  if (e.button === 2) {
    if (!props.isPolygonComplete && props.points.length >= 3) {
      emit("complete-polygon");
      isDrawing.value = false;
      currentPoint.value = null;
    }
    return;
  }

  // ЛКМ
  if (!props.isPolygonComplete) {
    isDrawing.value = true;
    currentPoint.value = pos;
    if (props.points.length === 0) {
      emit("add-point", pos);
    }
  } else {
    // В режиме редактирования - проверяем попадание в вершину
    const idx = props.points.findIndex(
      (p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 10
    );
    if (idx !== -1) {
      draggingPointIndex.value = idx;
    }
  }
};

// Подсказка-курсор при наведении на вершину
const hoveredVertexIndex = ref(null);

const onMouseMove = (e) => {
  const pos = getMousePos(e);
  const canvas = canvasRef.value;
  pos.x = Math.max(0, Math.min(pos.x, canvas.width));
  pos.y = Math.max(0, Math.min(pos.y, canvas.height));

  // Курсор
  let found = false;
  for (let i = 0; i < props.points.length; i++) {
    const p = props.points[i];
    if (Math.hypot(p.x - pos.x, p.y - pos.y) < 10) {
      hoveredVertexIndex.value = i;
      found = true;
      break;
    }
  }
  if (!found) hoveredVertexIndex.value = null;
  if (canvas) {
    if (hoveredVertexIndex.value !== null && props.isPolygonComplete) {
      canvas.style.cursor = draggingPointIndex.value !== null ? 'grabbing' : 'grab';
    } else {
      canvas.style.cursor = isDrawing.value && !props.isPolygonComplete ? 'crosshair' : 'default';
    }
  }

  if (isDrawing.value && !props.isPolygonComplete) {
    currentPoint.value = pos;
    draw();
  }
  if (draggingPointIndex.value !== null) {
    emit("update-point", props.points[draggingPointIndex.value].id, pos);
  }
};

const onMouseUp = (e) => {
  const pos = getMousePos(e);
  if (!props.isPolygonComplete && isDrawing.value && props.points.length > 0) {
    emit("add-point", pos);
  }
  isDrawing.value = false;
  currentPoint.value = null;
  draggingPointIndex.value = null;
  draw();
};

const badVertexIndices = computed(() => {
  // Критерии: малый угол (< 20°), совпадающие точки, перегибы
  if (!props.isPolygonComplete || props.points.length < 3) return [];
  const indices = [];
  const coords = props.points.map((p) => [p.x, p.y]);
  for (let i = 0; i < coords.length; i++) {
    const prev = coords[(i - 1 + coords.length) % coords.length];
    const curr = coords[i];
    const next = coords[(i + 1) % coords.length];
    // Совпадающие точки
    if (Math.hypot(curr[0] - prev[0], curr[1] - prev[1]) < 1e-2 || Math.hypot(curr[0] - next[0], curr[1] - next[1]) < 1e-2) {
      indices.push(i);
      continue;
    }
    // Малый угол
    const v1 = [prev[0] - curr[0], prev[1] - curr[1]];
    const v2 = [next[0] - curr[0], next[1] - curr[1]];
    const dot = v1[0]*v2[0] + v1[1]*v2[1];
    const len1 = Math.hypot(...v1);
    const len2 = Math.hypot(...v2);
    if (len1 > 1e-2 && len2 > 1e-2) {
      const angle = Math.acos(dot / (len1 * len2)) * 180 / Math.PI;
      if (angle < 20) indices.push(i);
    }
  }
  return indices;
});
</script>

<template>
  <canvas
    ref="canvasRef"
    width="600"
    height="500"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @contextmenu.prevent
    class="w-full h-full bg-white"
    style="cursor: crosshair"
  />
</template>
