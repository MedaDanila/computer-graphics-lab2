<script setup>
import { computed } from "vue";
import { getAngleType } from "../utils/rounding";

const props = defineProps({
  points: {
    type: Array,
    required: true,
  },
  scale: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["remove-point", "generate-random-polygon"]);

const angleTypes = computed(() => {
  if (props.points.length < 3) return [];
  const coords = props.points.map((p) => [p.x, p.y]);
  return props.points.map((_, i) => getAngleType(coords, i));
});

// Конвертация пикселей в метры с учетом масштаба
const toMeters = (pixels) => {
  return (pixels / 20) * props.scale; // 20px = 1м по умолчанию
};

// Форматирование числа с 1 десятичным знаком и добавлением "м"
const formatCoordinates = (point) => {
  return `(${toMeters(point.x).toFixed(1)}м, ${toMeters(point.y).toFixed(1)}м)`;
};
</script>

<template>
  <div class="vertex-list">
    <h2 class="vertex-list__title">
      <svg class="vertex-list__icon" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      Управление точками
    </h2>

    <div class="scale-info">Масштаб: 20px = {{ scale }}м</div>

    <div v-if="points.length === 0" class="vertex-list__empty">
      <div class="vertex-list__empty-content">
        <p class="vertex-list__empty-text">Нет точек</p>
        <p class="vertex-list__empty-hint">Добавьте точки на холст</p>
      </div>
    </div>

    <div v-else class="vertex-list__content">
      <div class="vertex-list__items">
        <div
          v-for="(point, index) in points"
          :key="point.id"
          class="vertex-item"
        >
          <div class="vertex-item__info">
            <span class="vertex-item__number">{{ index + 1 }}</span>
            <div class="vertex-item__coordinates">
              <span>{{ formatCoordinates(point) }}</span>
              <span
                v-if="angleTypes[index]"
                :style="
                  angleTypes[index] === 'convex'
                    ? 'color: #16a34a;'
                    : 'color: #7c3aed;'
                "
                class="angle-type"
              >
                {{ angleTypes[index] === "convex" ? "выпуклый" : "вогнутый" }}
              </span>
            </div>
          </div>
          <button
            @click="emit('remove-point', point.id)"
            class="vertex-item__delete"
            title="Удалить точку"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M14 16L16 14L10 8L16 2L14 0L8 6L2 0L0 2L6 8L0 14L2 16L8 10L14 16Z"
                fill="black"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vertex-list {
  --glass-bg: rgba(255, 255, 255, 0.18);
  --glass-border: rgba(255, 255, 255, 0.24);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.18);

  height: 100%;
  max-height: 379px;
  position: relative;

  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border-radius: 1.5rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  overflow: hidden;

  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  &__icon {
    width: 1em;
    height: 1em;
    stroke: #38bdf8;
    stroke-width: 2;
  }

  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  &__empty-content {
    text-align: center;
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      rgba(241, 245, 249, 0.8),
      rgba(226, 232, 240, 0.6)
    );
    border-radius: 0.75rem;
    border: 1px solid rgba(203, 213, 225, 0.4);
    width: 100%;
  }

  &__empty-text {
    color: #64748b;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  &__empty-hint {
    color: #94a3b8;
    font-size: 0.75rem;
  }

  &__content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &__items {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
    margin-right: -0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(203, 213, 225, 0.5);
      border-radius: 3px;
      transition: background 0.2s;

      &:hover {
        background: rgba(203, 213, 225, 0.7);
      }
    }
  }
}

.scale-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #64748b;
}

.vertex-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.75rem;
  border: 1px solid rgba(203, 213, 225, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-grow: 1;
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background-color: #e2e8f0;
    color: #475569;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  &__coordinates {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: "Roboto Mono", monospace;
    font-size: 0.8rem;
    color: #334155;
  }

  &__delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    color: #ef4444;
    background: rgba(254, 226, 226, 0.7);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0.25rem;
    flex-shrink: 0;

    &:hover {
      color: #dc2626;
      background: rgba(254, 226, 226, 0.9);
      transform: scale(1.1);
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
    }
  }
}

.coordinate-input {
  width: 50px;
  padding: 2px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px #38bdf8;
  }
}

.angle-type {
  margin-left: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: lowercase;
}
</style>
