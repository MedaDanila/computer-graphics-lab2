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
  <div class="container">
    <h1>Скругление углов полигона</h1>
    <!-- Инструкции -->
    <div class="card mb-4" v-if="!isPolygonComplete">
      <h2 class="font-semibold mb-2">Инструкция по управлению:</h2>
      <ul style="padding-left: 1.2em;">
        <li><b>ЛКМ</b> — добавление вершины полигона</li>
        <li><b>ПКМ</b> — завершение построения (замыкание) полигона</li>
        <li><b>Захват и перемещение вершины</b>:<br>
          <ul style="margin-top: 2px; margin-bottom: 2px;">
            <li>После замыкания полигона наведите курсор на вершину (курсор станет <b>рукой</b>)</li>
            <li>Зажмите ЛКМ на вершине и перемещайте мышь — вершина будет двигаться</li>
            <li>Во время перемещения курсор — <b>захваченная рука</b></li>
          </ul>
        </li>
        <li>Вершины с ошибками (малый угол, совпадение, перегиб) — <span style="color: #dc2626;">пустой красный круг</span></li>
        <li>После минимизации неправильные вершины будут удалены или исправлены</li>
        <li>Сетка на холсте помогает точному построению</li>
      </ul>
    </div>
    <div class="flex" style="gap: 24px; flex-wrap: wrap;">
      <div style="flex: 1 1 320px; min-width: 320px; max-width: 400px;">
        <div v-if="isPolygonComplete" class="card mb-4" style="background: #e6fbe6;">
          <p style="color: #15803d;">Полигон замкнут! Теперь вы можете:</p>
          <ul style="padding-left: 1.2em; margin-top: 8px;">
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
      <div style="flex: 2 1 600px; min-width: 400px;">
        <CanvasRenderer
          :points="points"
          :roundedPath="roundedPolygon"
          :radius="radius"
          :roundingType="roundingType"
          :isPolygonComplete="isPolygonComplete"
          @add-point="addPoint"
          @update-point="updatePoint"
          @complete-polygon="completePolygon"
          class="card"
          style="border: 1px solid #d1d5db; min-height: 500px; background: #fff;"
        />
      </div>
    </div>
  </div>
</template>
