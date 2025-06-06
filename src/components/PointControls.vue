<script setup>
import { computed } from "vue";
import { getAngleType } from "../utils/rounding";

// Пропсы: массив точек и параметры скругления
const props = defineProps({
  points: {
    type: Array,
    required: true,
  },
  radius: {
    type: Number,
    required: true,
  },
  roundingType: {
    type: String,
    required: true,
  },
});

// Эвенты: добавить случайный полигон, удалить точку, обновить точку
const emit = defineEmits(["generate-random-polygon", "remove-point", "update-point"]);

// Вычисляем тип каждого угла (convex/concave)
const angleTypes = computed(() => {
  if (props.points.length < 3) return [];
  const coords = props.points.map((p) => [p.x, p.y]);
  return props.points.map((_, i) => getAngleType(coords, i));
});

function onCoordInput(point, key, e) {
  // Ограничиваем до 2 знаков после запятой прямо в поле
  let val = e.target.value;
  if (val.includes('.')) {
    const [int, dec] = val.split('.');
    if (dec.length > 2) {
      val = int + '.' + dec.slice(0, 2);
      e.target.value = val;
    }
  }
  point[key] = Number(val);
  emit('update-point', point.id, { x: point.x, y: point.y });
}

function onCoordBlur(point, key) {
  // Округляем до 2 знаков после потери фокуса
  point[key] = Number(Number(point[key]).toFixed(2));
  emit('update-point', point.id, { x: point.x, y: point.y });
}
</script>

<template>
  <div class="card">
    <h2 class="text-lg font-semibold mb-2">Управление точками</h2>
    <div class="flex space-x-2 mb-4">
      <button
        @click="emit('generate-random-polygon')"
        class="button"
      >
        Сгенерировать случайный полигон
      </button>
    </div>
    <div v-if="props.points.length" style="display: flex; flex-direction: column; gap: 8px;">
      <div
        v-for="(point, index) in props.points"
        :key="point.id"
        class="flex items-center rounded border"
        style="background: #fff; padding: 8px; border: 1px solid #d1d5db;"
      >
        <input
          type="number"
          step="0.01"
          v-model.number="point.x"
          @input="onCoordInput(point, 'x', $event)"
          @blur="onCoordBlur(point, 'x')"
          class="w-16"
          style="margin-right: 4px;"
        />
        <span>,</span>
        <input
          type="number"
          step="0.01"
          v-model.number="point.y"
          @input="onCoordInput(point, 'y', $event)"
          @blur="onCoordBlur(point, 'y')"
          class="w-16"
          style="margin-left: 4px;"
        />
        <span
          v-if="angleTypes[index]"
          :style="angleTypes[index] === 'convex' ? 'color: #16a34a;' : 'color: #7c3aed;'"
          class="text-xs font-medium ml-2"
        >
          {{ angleTypes[index] === "convex" ? "выпуклый" : "вогнутый" }}
        </span>
        <button
          @click="emit('remove-point', point.id)"
          style="margin-left: auto; color: #dc2626; background: none; border: none; font-size: 1.2em; cursor: pointer;"
          title="Удалить точку"
        >
          ×
        </button>
      </div>
    </div>
    <p v-else style="color: #888;">Кликните на холсте, чтобы добавить точки</p>
  </div>
</template>
