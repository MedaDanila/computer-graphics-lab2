<script setup>
import { ref, computed } from 'vue';
import { roundPolygonCorners } from './utils/rounding';
import CanvasRenderer from './components/CanvasRenderer.vue';
import PointControls from './components/PointControls.vue';
import RoundingControls from './components/RoundingControls.vue';

// Состояние приложения
const points = ref([]);
const isPolygonComplete = ref(false);
const radius = ref(30);
const roundingType = ref('all');
const isAnimating = ref(false);
const animationProgress = ref(0);

// Генерация случайного полигона
const generateRandomPolygon = () => {
  // Сбрасываем текущее состояние
  points.value = [];
  isPolygonComplete.value = false;
  
  // Параметры генерации
  const numPoints = Math.floor(Math.random() * 3) + 4; // 4-6 точек
  const centerX = 300; // Центр холста
  const centerY = 250;
  const minRadius = 100; // Минимальное расстояние от центра
  const maxRadius = 200; // Максимальное расстояние от центра
  
  // Генерируем точки по кругу с случайным смещением
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const offset = 20 - Math.random() * 40; // Случайное смещение ±20 пикселей
    
    points.value.push({
      x: centerX + radius * Math.cos(angle) + offset,
      y: centerY + radius * Math.sin(angle) + offset,
      id: Date.now() + Math.random(),
    });
  }
  
  // Замыкаем полигон
  isPolygonComplete.value = true;
  // Запускаем анимацию скругления
  animateRounding();
};

// Добавление точки (в режиме рисования)
const addPoint = (pos) => {
  if (isPolygonComplete.value) return;
  
  // Проверяем минимальное расстояние между точками
  if (points.value.length > 0) {
    const lastPoint = points.value[points.value.length - 1];
    const distance = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
    if (distance < 10) return; // Минимальное расстояние 10 пикселей
  }
  
  points.value.push({
    ...pos,
    id: Date.now() + Math.random(),
  });
};

// Завершение полигона (ПКМ)
const completePolygon = () => {
  if (points.value.length >= 3) {
    isPolygonComplete.value = true;
    animateRounding(); // Автоматически запускаем анимацию при замыкании
  }
};

// Удаление точки
const removePoint = (id) => {
  points.value = points.value.filter(p => p.id !== id);
  // Если осталось меньше 3 точек, отключаем режим завершенного полигона
  if (points.value.length < 3) {
    isPolygonComplete.value = false;
  }
};

// Скруглённый полигон
const roundedPolygon = computed(() => {
  if (!isPolygonComplete.value || points.value.length < 3) return [];
  try {
    return roundPolygonCorners(
      points.value.map(p => [p.x, p.y]),
      Math.max(5, Math.min(100, radius.value)), // Ограничиваем радиус
      roundingType.value,
      isAnimating.value ? animationProgress.value : 1
    );
  } catch (error) {
    console.error('Error in roundPolygonCorners:', error);
    return [];
  }
});

// Обновление позиции вершины (перетаскивание)
const updatePoint = (id, newPos) => {
  const idx = points.value.findIndex(p => p.id === id);
  if (idx !== -1) {
    points.value[idx] = { ...points.value[idx], ...newPos };
  }
};

// Обработчики обновления параметров
const updateRadius = (val) => {
  radius.value = Number(val);
};

const updateRoundingType = (val) => {
  roundingType.value = val;
};

// Анимация скругления
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
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Скругление углов полигона</h1>
    
    <!-- Инструкции -->
    <div class="mb-4 p-4 bg-blue-50 rounded-lg" v-if="!isPolygonComplete">
      <h2 class="font-semibold mb-2">Инструкция по созданию полигона:</h2>
      <ol class="list-decimal list-inside space-y-1">
        <li>Нажмите ЛКМ для создания первой вершины</li>
        <li>Удерживайте ЛКМ и перетащите для создания следующей вершины</li>
        <li>Продолжайте добавлять вершины, нажимая и перетаскивая ЛКМ</li>
        <li>Нажмите ПКМ для замыкания полигона (минимум 3 вершины)</li>
        <li>После замыкания можно перетаскивать вершины для изменения формы</li>
      </ol>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="space-y-4">
        <div v-if="isPolygonComplete" class="p-4 bg-green-50 rounded-lg">
          <p class="text-green-700">Полигон замкнут! Теперь вы можете:</p>
          <ul class="list-disc list-inside mt-2">
            <li>Перетаскивать вершины для изменения формы</li>
            <li>Настраивать радиус скругления ({{ radius }})</li>
            <li>Выбирать тип скругления ({{ roundingType }})</li>
            <li>Запускать анимацию</li>
          </ul>
        </div>
        
        <PointControls
          :points="points"
          @remove-point="removePoint"
          @generate-random-polygon="generateRandomPolygon"
        />
        <RoundingControls
          :radius="radius"
          :roundingType="roundingType"
          :isAnimating="isAnimating"
          @update-radius="updateRadius"
          @update-type="updateRoundingType"
          @animate="animateRounding"
        />
      </div>
      <div class="lg:col-span-2">
        <CanvasRenderer
          :points="points"
          :roundedPath="roundedPolygon"
          :radius="radius"
          :roundingType="roundingType"
          :isPolygonComplete="isPolygonComplete"
          @add-point="addPoint"
          @update-point="updatePoint"
          @complete-polygon="completePolygon"
          class="border border-gray-300 rounded-lg shadow-lg"
        />
      </div>
    </div>
  </div>
</template>
