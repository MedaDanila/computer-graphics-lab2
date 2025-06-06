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

function onRadiusInput(e) {
  let val = Number(e.target.value);
  val = Number(val.toFixed(2));
  emit('update-radius', val);
}
</script>

<template>
  <div class="card">
    <h2 class="text-lg font-semibold mb-2">Параметры скругления</h2>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Слайдер радиуса -->
      <div>
        <label style="margin-bottom: 4px; display: block; font-weight: 500;">
          Радиус скругления: <span style="font-weight: 600;">{{ currentRadius }}</span>
        </label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input
            type="range"
            min="5"
            max="150"
            step="0.01"
            v-model.number="currentRadius"
            style="flex: 1;"
          />
          <input
            type="number"
            min="5"
            max="150"
            step="0.01"
            v-model.number="currentRadius"
            @input="onRadiusInput"
            style="width: 60px; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px;"
          />
        </div>
        <p style="font-size: 0.9em; color: #888; margin-top: 4px;">
          Фактический радиус скругления будет автоматически адаптирован к размеру угла
        </p>
      </div>
      <!-- Выбор типа скругления -->
      <div>
        <label style="margin-bottom: 4px; display: block; font-weight: 500;">Тип скругления:</label>
        <select
          v-model="currentType"
          style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px;"
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
        class="button"
        style="width: 100%; background: #22c55e; margin-top: 8px;"
        :style="props.isAnimating ? 'background: #d1d5db; color: #888; cursor: not-allowed;' : ''"
      >
        {{ props.isAnimating ? "Анимация..." : "Анимировать" }}
      </button>
    </div>
  </div>
</template>
