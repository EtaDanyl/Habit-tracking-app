<template>
  <div class="day-navigation">
    <button
      v-for="day in surroundingDays"
      :key="day.date"
      :class="['day-lozenge', { selected: day.date === selectedDate, future: day.isFuture }]"
      @click="$emit('change-date', day.date)"
      :title="day.isFuture ? 'Future day – cannot mark habits yet' : ''"
    >
      {{ day.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getSurrounding7Days } from '../utils/dateUtils'

const props = defineProps({
  selectedDate: String
})

const today = new Date()
today.setHours(0, 0, 0, 0)

const surroundingDays = computed(() => {
  return getSurrounding7Days().map(dateStr => {
    const dateObj = new Date(dateStr)
    const isFuture = dateObj > today

    const options = { weekday: 'short', month: 'numeric', day: 'numeric' }
    const label = dateObj.toLocaleDateString(undefined, options)

    return { date: dateStr, label, isFuture }
  })
})
</script>

<style scoped>
.day-navigation {
  display: flex;
  gap: 8px;
  padding: 10px 0;
  overflow-x: auto;
}

.day-lozenge {
  border: none;
  padding: 6px 14px;
  border-radius: 9999px;
  background-color: #a6e1d2;
  color: #064e3b;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.day-lozenge.selected {
  background-color: #3eb489;
  color: white;
  font-weight: 600;
}

.day-lozenge.future {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px dashed #ccc;
}

.day-lozenge:hover:not(.selected):not(.future) {
  background-color: #7ed6c5;
}
</style>
