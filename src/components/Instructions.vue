<script setup>
import { ref } from "vue";

const showModal = ref(false);
</script>

<template>
  <div class="instruction-card">
    <h2 class="instruction-card__title">
      <svg class="instruction-card__icon" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Инструкция по управлению
    </h2>

    <div class="instruction-card__content">
      <div class="instruction-step">
        <h3 class="instruction-step__title">Основные действия:</h3>
        <ol class="instruction-step__list">
          <li class="instruction-step__item">
            <span class="instruction-step__number">1</span>
            <span class="instruction-step__text"
              ><b>ЛКМ</b> — добавление вершины полигона</span
            >
          </li>
          <li class="instruction-step__item">
            <span class="instruction-step__number">2</span>
            <span class="instruction-step__text"
              ><b>ПКМ</b> — завершение построения (замыкание) полигона</span
            >
          </li>
        </ol>
        <button @click="showModal = true" class="details-button">
          Подробнее
          <svg class="details-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="showModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h3 class="modal-title">Подробные правила</h3>

          <div class="modal-section">
            <h4 class="modal-subtitle">Построение полигона:</h4>
            <ul class="modal-list">
              <li>Минимальное количество точек - 3</li>
              <li>
                Точки добавляются последовательно по клику левой кнопкой мыши
              </li>
              <li>При наведении на точку курсор меняется на указатель руки</li>
              <li>
                Для замыкания полигона кликните рядом с первой точкой (в
                пределах 15 пикселей)
              </li>
              <li>Сетка на канвасе помогает точному построению</li>
            </ul>
          </div>

          <div class="modal-section">
            <h4 class="modal-subtitle">Типы скругления:</h4>
            <ul class="modal-list">
              <li><b>Все углы</b> - скругляет все углы полигона</li>
              <li>
                <b>Выпуклые</b> - скругляет только выпуклые углы (углы,
                направленные наружу)
              </li>
              <li>
                <b>Вогнутые</b> - скругляет только вогнутые углы (углы,
                направленные внутрь)
              </li>
              <li>
                Тип скругления можно менять в любой момент после замыкания
                полигона
              </li>
            </ul>
          </div>

          <div class="modal-section">
            <h4 class="modal-subtitle">Управление точками:</h4>
            <ul class="modal-list">
              <li>После замыкания полигона точки можно перемещать</li>
              <li>
                Для перемещения точки:
                <ul class="modal-sublist">
                  <li>Наведите курсор на точку (курсор станет рукой)</li>
                  <li>Зажмите левую кнопку мыши</li>
                  <li>Перетащите точку в новое положение</li>
                  <li>Отпустите кнопку мыши</li>
                </ul>
              </li>
              <li>
                При перемещении точек скругление автоматически пересчитывается
              </li>
            </ul>
          </div>

          <div class="modal-section">
            <h4 class="modal-subtitle">Визуальные элементы:</h4>
            <ul class="modal-list">
              <li>
                <span class="color-dot blue"></span> Точки полигона -
                пронумерованные синие точки
              </li>
              <li>
                <span class="color-dot red"></span> Скругленный контур - красная
                линия
              </li>
              <li>
                <span class="color-dot green"></span> Центры скругления -
                зеленые точки
              </li>
              <li>
                <span class="color-dot orange"></span> Точки сопряжения -
                оранжевые точки
              </li>
            </ul>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
/* Стили остаются такими же, как в вашем шаблоне */
.instruction-card {
  --glass-bg: rgba(255, 255, 255, 0.92);
  --glass-border: rgba(203, 213, 225, 0.3);
  --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);

  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1.25rem;
  }

  &__icon {
    width: 1.25em;
    height: 1.25em;
    stroke: currentColor;
    stroke-width: 2;
    color: #60a5fa;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}

.instruction-step {
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(147, 197, 253, 0.4);
  background: linear-gradient(
    135deg,
    rgba(219, 234, 254, 0.7),
    rgba(191, 219, 254, 0.4)
  );
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);

  &__title {
    font-weight: 600;
    font-size: 1rem;
    color: #1e40af;
    margin-bottom: 1rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    line-height: 1.5;
  }

  &__number {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(59, 130, 246, 0.15);
    color: #1e40af;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.75rem;
    transition: all 0.2s ease;
  }

  &__text {
    font-size: 0.9rem;
    color: #1e40af;
    padding-top: 0.125rem;
  }

  &__item:hover &__number {
    background-color: rgba(59, 130, 246, 0.25);
    transform: scale(1.1);
  }
}

.details-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: #1e40af;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
  }
}

.details-icon {
  width: 1rem;
  height: 1rem;
}

/* Стили модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    stroke-width: 2;
  }
}

.modal-title {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.modal-section {
  margin-bottom: 1.5rem;
}

.modal-subtitle {
  font-size: 1.1rem;
  color: #334155;
  margin-bottom: 0.75rem;
}

.modal-list {
  padding-left: 1.5rem;
  line-height: 1.6;

  li {
    margin-bottom: 0.5rem;
  }
}

.vertex-types {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.vertex-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vertex-example {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
}

.vertex-normal {
  background: #64748b;
}

.vertex-bad {
  background: white;
  border: 3px solid #ef4444;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.3rem;
  }
}
</style>
