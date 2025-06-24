<template>
  <div>
    <DayNavigation :selectedDate="selectedDate" @change-date="onChangeDate" />
    <HabitList :selectedDate="selectedDate" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DayNavigation from '../components/DayNavigation.vue'
import HabitList from '../components/HabitList.vue'

const route = useRoute()
const router = useRouter()

const today = new Date().toISOString().slice(0, 10)
const selectedDate = ref(route.params.date || today)

function validateDate(dateStr) {
  const date = new Date(dateStr)
  if (isNaN(date)) return false
  const todayDate = new Date()
  if (date > todayDate) return false
  return true
}

if (!validateDate(selectedDate.value)) {
  selectedDate.value = today
  router.replace(`/day/${today}`)
}

function onChangeDate(newDate) {
  if (validateDate(newDate)) {
    selectedDate.value = newDate
    router.push(`/day/${newDate}`)
  }
}

watch(() => route.params.date, (newDate) => {
  if (validateDate(newDate)) {
    selectedDate.value = newDate
  } else {
    selectedDate.value = today
    router.replace(`/day/${today}`)
  }
})
</script>

<style scoped>
div {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  box-sizing: border-box;
}

@media (min-width: 600px) {
  div {
    padding: 24px 32px;
  }
}
</style>
