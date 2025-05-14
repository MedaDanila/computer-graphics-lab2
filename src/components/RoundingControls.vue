<script setup>
import { computed } from 'vue';

// Пропсы для управления скруглением
const props = defineProps({
  radius: {
    type: Number,
    required: true,
    default: 30,
  },
  roundingType: {
    type: String,
    required: true,
    default: 'all',
  },
  isAnimating: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Эвенты: обновление радиуса, типа и запуск анимации
const emit = defineEmits(["update-radius", "update-type", "animate"]);

// Вычисляемые свойства для контроля значений
const currentRadius = computed({
  get: () => props.radius,
  set: (value) => emit('update-radius', Number(value))
});

const currentType = computed({
  get: () => props.roundingType,
  set: (value) => emit('update-type', value)
});
</script>

<template>
  <div class="bg-gray-50 p-4 rounded-lg">
    <h2 class="text-lg font-semibold mb-2">Параметры скругления</h2>

    <div class="space-y-4">
      <!-- Слайдер радиуса -->
      <div>
        <label class="block text-sm font-medium mb-1">
          Радиус скругления: <span class="font-medium">{{ currentRadius }}</span>
        </label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            min="5"
            max="150"
            step="1"
            v-model.number="currentRadius"
            class="flex-1"
          />
          <input
            type="number"
            min="5"
            max="150"
            v-model.number="currentRadius"
            class="w-16 p-1 border rounded"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Фактический радиус скругления будет автоматически адаптирован к размеру угла
        </p>
      </div>

      <!-- Выбор типа скругления -->
      <div>
        <label class="block text-sm font-medium mb-1">Тип скругления:</label>
        <select
          v-model="currentType"
          class="w-full p-2 border rounded"
        >
          <option value="all">Все углы</option>
          <option value="convex">Только выпуклые</option>
          <option value="concave">Только вогнутые</option>
        </select>
      </div>

      <!-- Кнопка анимации -->
      <button
        @click="emit('animate')"
        :disabled="props.isAnimating"
        class="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 transition-colors"
      >
        {{ props.isAnimating ? "Анимация..." : "Анимировать" }}
      </button>
    </div>
  </div>
</template>
