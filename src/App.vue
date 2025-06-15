<script setup>
import { ref, computed } from "vue";
import { roundPolygonCorners } from "./utils/rounding";
import CanvasRenderer from "./components/CanvasRenderer.vue";
import VertexList from "./components/VertexList.vue";
import Instructions from "./components/Instructions.vue";

const points = ref([]);
const isPolygonComplete = ref(false);
const radius = ref(30);
const roundingType = ref("all");
const isAnimating = ref(false);
const animationProgress = ref(0);
const scale = ref(1);

const generateRandomPolygon = () => {
  points.value = [];
  isPolygonComplete.value = false;

  const numPoints = Math.floor(Math.random() * 3) + 4;
  const centerX = 300;
  const centerY = 250;
  const minRadius = 100;
  const maxRadius = 200;

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const offset = 20 - Math.random() * 40;

    points.value.push({
      x: centerX + radius * Math.cos(angle) + offset,
      y: centerY + radius * Math.sin(angle) + offset,
      id: Date.now() + Math.random(),
    });
  }

  isPolygonComplete.value = true;
  animateRounding();
};

const addPoint = (pos) => {
  if (isPolygonComplete.value) return;

  if (points.value.length > 0) {
    const lastPoint = points.value[points.value.length - 1];
    const distance = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
    if (distance < 10) return;
  }

  points.value.push({
    ...pos,
    id: Date.now() + Math.random(),
  });
};

const completePolygon = () => {
  if (points.value.length >= 3) {
    isPolygonComplete.value = true;
    animateRounding();
  }
};

const removePoint = (id) => {
  points.value = points.value.filter((p) => p.id !== id);
  if (points.value.length < 3) {
    isPolygonComplete.value = false;
  }
};

const roundedPolygon = computed(() => {
  if (!isPolygonComplete.value || points.value.length < 3)
    return { segments: [], limitedAngles: [] };
  try {
    return roundPolygonCorners(
      points.value.map((p) => [p.x, p.y]),
      Math.max(5, Math.min(100, radius.value)),
      roundingType.value,
      isAnimating.value ? animationProgress.value : 1
    );
  } catch (error) {
    console.error("Error in roundPolygonCorners:", error);
    return { segments: [], limitedAngles: [] };
  }
});

const updatePoint = (id, newPos) => {
  const idx = points.value.findIndex((p) => p.id === id);
  if (idx !== -1) {
    points.value[idx] = { ...points.value[idx], ...newPos };
  }
};

const animateRounding = () => {
  isAnimating.value = true;
  animationProgress.value = 0;

  const duration = 1000;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    animationProgress.value = Math.min(elapsed / duration, 1);
    if (animationProgress.value < 1) {
      requestAnimationFrame(animate);
    } else {
      isAnimating.value = false;
    }
  };
  requestAnimationFrame(animate);
};
</script>

<template>
  <div class="main">
    <div class="controls">
      <Instructions />
      <VertexList
        :points="points"
        :scale="scale"
        @remove-point="removePoint"
        @update-point="updatePoint"
        @generate-random-polygon="generateRandomPolygon"
      />
    </div>
    <div class="canvas">
      <CanvasRenderer
        :points="points"
        :roundedPath="roundedPolygon.segments"
        :radius="radius"
        :roundingType="roundingType"
        :isPolygonComplete="isPolygonComplete"
        @add-point="addPoint"
        @update-point="updatePoint"
        @complete-polygon="completePolygon"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  width: 100%;
  height: auto;

  padding: 24px;

  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 14px;
}

.controls {
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
