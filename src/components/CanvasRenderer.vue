<script setup>
import { onMounted, ref, watch, onUnmounted } from "vue";

const props = defineProps({
  points: {
    type: Array,
    required: true,
    validator: (value) => {
      const uniquePoints = new Set(value.map((p) => `${p.x},${p.y}`));
      return uniquePoints.size === value.length;
    },
  },
  roundedPath: Array,
  radius: Number,
  roundingType: String,
  isPolygonComplete: Boolean,
});

const emit = defineEmits(["add-point", "update-point", "complete-polygon"]);

const canvasRef = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);
const isDragging = ref(false);
const currentPoint = ref(null);
const draggedPoint = ref(null);
const gridSize = 20;
const snapToGrid = ref(true);

const getMousePos = (e) => {
  const canvasElement = canvasRef.value;
  const rect = canvasElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const x = (e.clientX - rect.left) * (canvasElement.width / rect.width / dpr);
  const y = (e.clientY - rect.top) * (canvasElement.height / rect.height / dpr);

  if (snapToGrid.value) {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }

  return { x, y };
};

const initCanvas = () => {
  const canvasElement = canvasRef.value;
  ctx.value = canvasElement.getContext("2d");

  const resizeCanvas = () => {
    const container = canvasElement.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvasElement.width = container.clientWidth * dpr;
    canvasElement.height = container.clientHeight * dpr;
    canvasElement.style.width = container.clientWidth + "px";
    canvasElement.style.height = container.clientHeight + "px";
    ctx.value.setTransform(1, 0, 0, 1, 0, 0);
    ctx.value.scale(dpr, dpr);
    draw();
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
};

const drawGrid = () => {
  const canvasElement = canvasRef.value;
  const width = canvasElement.width / (window.devicePixelRatio || 1);
  const height = canvasElement.height / (window.devicePixelRatio || 1);

  ctx.value.strokeStyle = "#e0e7ef";
  ctx.value.lineWidth = 0.7;
  ctx.value.font = "10px Arial";
  ctx.value.fillStyle = "#94a3b8";
  ctx.value.textAlign = "center";
  ctx.value.textBaseline = "top";

  for (let x = 0; x <= width; x += gridSize) {
    ctx.value.beginPath();
    ctx.value.moveTo(x, 0);
    ctx.value.lineTo(x, height);
    ctx.value.stroke();

    if (x % (gridSize * 5) === 0 && x > 0) {
      ctx.value.fillText(`${(x / gridSize) * 1}m`, x, 5);
    }
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.value.beginPath();
    ctx.value.moveTo(0, y);
    ctx.value.lineTo(width, y);
    ctx.value.stroke();

    if (y % (gridSize * 5) === 0 && y > 0) {
      ctx.value.textAlign = "left";
      ctx.value.fillText(`${(y / gridSize) * 1}m`, 5, y);
      ctx.value.textAlign = "center";
    }
  }

  ctx.value.textAlign = "left";
  ctx.value.fillText("0", 5, 5);
};

const draw = () => {
  if (!ctx.value) return;
  const canvasElement = canvasRef.value;
  const width = canvasElement.width / (window.devicePixelRatio || 1);
  const height = canvasElement.height / (window.devicePixelRatio || 1);

  ctx.value.clearRect(0, 0, width, height);
  drawGrid();

  if (props.points.length > 0) {
    ctx.value.beginPath();
    ctx.value.moveTo(props.points[0].x, props.points[0].y);
    for (let i = 1; i < props.points.length; i++) {
      ctx.value.lineTo(props.points[i].x, props.points[i].y);
    }
    if (props.isPolygonComplete) ctx.value.closePath();
    ctx.value.strokeStyle = "#3b82f6";
    ctx.value.lineWidth = 2;
    ctx.value.shadowColor = "rgba(59,130,246,0.10)";
    ctx.value.shadowBlur = 8;
    ctx.value.stroke();
    ctx.value.shadowBlur = 0;
  }

  if (props.isPolygonComplete && props.roundedPath.length > 0) {
    ctx.value.beginPath();
    for (let i = 0; i < props.roundedPath.length; i++) {
      const seg = props.roundedPath[i];
      if (seg.type === "M") {
        ctx.value.moveTo(seg.to[0], seg.to[1]);
      } else if (seg.type === "L") {
        ctx.value.lineTo(seg.to[0], seg.to[1]);
      } else if (seg.type === "A") {
        const [start, end] = normalizeArcAngles(
          seg.startAngle,
          seg.endAngle,
          seg.anticlockwise
        );
        ctx.value.arc(
          seg.center[0],
          seg.center[1],
          seg.radius,
          start,
          end,
          seg.anticlockwise
        );
      } else if (seg.type === "Z") {
        ctx.value.closePath();
      }
    }
    ctx.value.strokeStyle = "#ef4444";
    ctx.value.lineWidth = 3;
    ctx.value.stroke();
    ctx.value.fillStyle = "rgba(239,68,68,0.1)";
    ctx.value.fill();
  }

  props.points.forEach((point, index) => {
    ctx.value.save();
    ctx.value.beginPath();
    ctx.value.arc(point.x, point.y, 11, 0, Math.PI * 2);

    ctx.value.fillStyle = "#64748b";
    ctx.value.strokeStyle = "#fff";
    ctx.value.lineWidth = 1;
    ctx.value.globalAlpha = 0.92;
    ctx.value.fill();
    ctx.value.stroke();

    ctx.value.globalAlpha = 1;
    ctx.value.fillStyle = "#ffffff";
    ctx.value.font = "14px Arial";
    ctx.value.textAlign = "center";
    ctx.value.textBaseline = "middle";
    ctx.value.fillText((index + 1).toString(), point.x, point.y);
    ctx.value.restore();
  });

  if (isDrawing.value && currentPoint.value && !props.isPolygonComplete) {
    const last = props.points[props.points.length - 1];
    ctx.value.beginPath();
    ctx.value.moveTo(last.x, last.y);
    ctx.value.lineTo(currentPoint.value.x, currentPoint.value.y);
    ctx.value.strokeStyle = "#9ca3af";
    ctx.value.setLineDash([5, 5]);
    ctx.value.stroke();
    ctx.value.setLineDash([]);
  }
};

const handleClick = (e) => {
  if (isDragging.value || props.isPolygonComplete) return;

  const { x, y } = getMousePos(e);
  emit("add-point", { x, y });
};

const handleMouseMove = (e) => {
  const { x, y } = getMousePos(e);
  currentPoint.value = { x, y };

  if (isDragging.value && draggedPoint.value !== null) {
    emit("update-point", props.points[draggedPoint.value].id, { x, y });
  }

  draw();
};

const handleMouseDown = (e) => {
  if (e.button === 2 || !props.isPolygonComplete) return;

  const { x, y } = getMousePos(e);

  for (let i = 0; i < props.points.length; i++) {
    const point = props.points[i];
    const distance = Math.sqrt(
      Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
    );

    if (distance <= 15) {
      isDragging.value = true;
      draggedPoint.value = i;
      return;
    }
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  draggedPoint.value = null;
};

const handleMouseLeave = () => {
  isDragging.value = false;
  draggedPoint.value = null;
};

const handleRightClick = (e) => {
  e.preventDefault();
  if (props.points.length >= 3 && !props.isPolygonComplete) {
    emit("complete-polygon");
    draw();
  }
};

function normalizeArcAngles(startAngle, endAngle, anticlockwise) {
  const TWO_PI = 2 * Math.PI;

  // Нормализуем в [0, 2π)
  startAngle = ((startAngle % TWO_PI) + TWO_PI) % TWO_PI;
  endAngle = ((endAngle % TWO_PI) + TWO_PI) % TWO_PI;

  // Определяем разницу углов
  let delta = endAngle - startAngle;
  if (!anticlockwise) {
    if (delta < 0) delta += TWO_PI;
  } else {
    if (delta > 0) delta -= TWO_PI;
  }

  // Корректируем endAngle
  endAngle = startAngle + delta;

  return [startAngle, endAngle];
}

onMounted(() => {
  initCanvas();
});

watch(
  () => [props.points, props.roundedPath, props.isPolygonComplete],
  () => draw(),
  { deep: true }
);

onUnmounted(() => {
  window.removeEventListener("resize", initCanvas);
});
</script>

<template>
  <div class="glass-card">
    <canvas
      ref="canvasRef"
      @click="handleClick"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @contextmenu.prevent="handleRightClick"
    ></canvas>
    <div class="scale-info">Масштаб: 20px = 1м</div>
  </div>
</template>

<style scoped>
.glass-card {
  --glass-bg: rgba(255, 255, 255, 0.18);
  --glass-border: rgba(255, 255, 255, 0.24);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.18);

  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border-radius: 1.5rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  width: 100%;
  height: 100%;
}

canvas {
  width: 100%;
  height: calc(100dvh - 96px);
  border-radius: 1rem;
  border: 1px solid rgba(203, 213, 225, 0.3);
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 16px rgba(59, 130, 246, 0.1);
}

.scale-info {
  position: absolute;
  bottom: 10px;
  right: 25px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}
</style>
