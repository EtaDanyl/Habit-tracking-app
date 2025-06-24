<template>
  <div class="habit-list">
    <h2>Habits for {{ selectedDate }}</h2>

    <div class="add-habit">
      <input
        v-model="newHabit"
        placeholder="New habit name"
        @keyup.enter="addHabit"
        @input="clearError"
        aria-invalid="false"
      />
      <button @click="addHabit">Add</button>
    </div>

    <div v-if="errorMessage" class="error-dialog-backdrop" @click.self="closeError">
      <div
        class="error-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-desc"
        tabindex="-1"
        ref="dialogRef"
      >
        <h3 id="error-dialog-title">Error</h3>
        <p id="error-dialog-desc">{{ errorMessage }}</p>
        <button @click="closeError" class="close-btn" aria-label="Close error dialog">
          Close
        </button>
      </div>
    </div>

    <ul>
      <li v-for="habit in habits" :key="habit.id" class="habit-item">
        <label :class="{ disabled: isFutureDay }">
          <input
            type="checkbox"
            :checked="isCompleted(habit.id)"
            :disabled="isFutureDay"
            @change="toggleCompletion(habit.id)"
          />
          {{ habit.name }}

          <span
            v-if="habitStreaks[habit.id]?.streak >= 3"
            :class="['streak', { 'longest-streak': habitStreaks[habit.id].isLongest }]"
            aria-label="Habit streak"
            title="Current streak"
          >
            🔥 {{ habitStreaks[habit.id].streak }}
          </span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import './HabitList.css'

const props = defineProps({
  selectedDate: String
})

const habits = ref([])
const completions = ref({})
const newHabit = ref('')
const isFutureDay = ref(false)
const errorMessage = ref('')
const dialogRef = ref(null)

const HABIT_LIST_KEY = 'habit-list'
const COMPLETIONS_KEY = 'habit-completions'

function loadHabits() {
  try {
    const stored = localStorage.getItem(HABIT_LIST_KEY)
    habits.value = stored ? JSON.parse(stored) : [
      { id: 1, name: 'Workout' },
      { id: 2, name: 'Read' },
      { id: 3, name: 'Meditate' }
    ]
  } catch (e) {
    showError('Failed to load habits from storage.')
  }
}

function saveHabits() {
  try {
    localStorage.setItem(HABIT_LIST_KEY, JSON.stringify(habits.value))
  } catch (e) {
    showError('Failed to save habits. Storage might be full.')
  }
}

function addHabit() {
  const name = newHabit.value.trim()
  if (!name) {
    showError('Please enter a habit name.')
    return
  }
  clearError()
  const id = Date.now()
  habits.value.push({ id, name })
  saveHabits()
  newHabit.value = ''
}

function loadCompletions() {
  try {
    const stored = localStorage.getItem(COMPLETIONS_KEY)
    completions.value = stored ? JSON.parse(stored) : {}
  } catch (e) {
    showError('Failed to load completions from storage.')
  }
}

function saveCompletions() {
  try {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions.value))
  } catch (e) {
    showError('Failed to save completions. Storage might be full.')
  }
}

function isCompleted(habitId) {
  return completions.value[props.selectedDate]?.includes(habitId) ?? false
}

function toggleCompletion(habitId) {
  if (isFutureDay.value) {
    showError("You can't mark habits for future days.")
    return
  }

  if (!completions.value[props.selectedDate]) {
    completions.value[props.selectedDate] = []
  }

  const index = completions.value[props.selectedDate].indexOf(habitId)
  if (index === -1) {
    completions.value[props.selectedDate].push(habitId)
  } else {
    completions.value[props.selectedDate].splice(index, 1)
  }

  saveCompletions()
}

function showError(msg) {
  errorMessage.value = msg
  nextTick(() => {
    dialogRef.value?.focus()
  })
}

function clearError() {
  errorMessage.value = ''
}

function closeError() {
  clearError()
}

watch(
  () => props.selectedDate,
  (newDate) => {
    const selected = new Date(newDate)
    const today = new Date()
    selected.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    isFutureDay.value = selected > today
  },
  { immediate: true }
)

onMounted(() => {
  loadHabits()
  loadCompletions()
})

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function calculateStreak(habitId, dateStr) {
  let streak = 0
  let longest = 0

  let date = new Date(dateStr)
  const completedOn = (dStr) => {
    return completions.value[dStr]?.includes(habitId) ?? false
  }

  let currentDate = new Date(date)
  while (true) {
    const dStr = formatDate(currentDate)
    if (completedOn(dStr)) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  const allDates = Object.keys(completions.value).sort()
  let tempStreak = 0
  for (let i = 0; i < allDates.length; i++) {
    const dStr = allDates[i]
    if (completedOn(dStr)) {
      tempStreak++
      if (tempStreak > longest) longest = tempStreak
    } else {
      tempStreak = 0
    }
  }

  return { streak, longest }
}

const habitStreaks = computed(() => {
  const result = {}

  habits.value.forEach(habit => {
    const { streak, longest } = calculateStreak(habit.id, props.selectedDate)
    result[habit.id] = {
      streak,
      isLongest: streak === longest && streak >= 3
    }
  })

  return result
})
</script>
