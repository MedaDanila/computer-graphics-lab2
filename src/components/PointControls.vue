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
</script>

<template>
  <div class="bg-gray-50 p-4 rounded-lg">
    <h2 class="text-lg font-semibold mb-2">Управление точками</h2>

    <div class="flex space-x-2 mb-4">
      <button
        @click="emit('generate-random-polygon')"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Сгенерировать случайный полигон
      </button>
    </div>

    <div v-if="props.points.length" class="space-y-2">
      <div
        v-for="(point, index) in props.points"
        :key="point.id"
        class="flex items-center space-x-2 p-2 bg-white rounded border"
      >
        <!-- Координаты с полями для редактирования -->
        <input
          type="number"
          v-model.number="point.x"
          @input="emit('update-point', point.id, { x: point.x, y: point.y })"
          class="w-16 p-1 border rounded"
        />
        <span>,</span>
        <input
          type="number"
          v-model.number="point.y"
          @input="emit('update-point', point.id, { x: point.x, y: point.y })"
          class="w-16 p-1 border rounded"
        />

        <!-- Тип угла -->
        <span
          v-if="angleTypes[index]"
          :class="{
            'text-green-600': angleTypes[index] === 'convex',
            'text-purple-600': angleTypes[index] === 'concave',
          }"
          class="text-xs font-medium ml-2"
        >
          {{ angleTypes[index] === "convex" ? "выпуклый" : "вогнутый" }}
        </span>

        <!-- Удалить точку -->
        <button
          @click="emit('remove-point', point.id)"
          class="ml-auto text-red-500 hover:text-red-700 p-1"
          title="Удалить точку"
        >
          ×
        </button>
      </div>
    </div>

    <p v-else class="text-gray-500">Кликните на холсте, чтобы добавить точки</p>
  </div>
</template>
