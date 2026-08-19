<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import CalendarGrid from '@/components/calendar/CalendarGrid.vue'
import SelectedDayPanel from '@/components/calendar/SelectedDayPanel.vue'
import FloatingAddButton from '@/components/calendar/FloatingAddButton.vue'
import EventModal from '@/components/calendar/EventModal.vue'
import { useEventStore } from '@/stores/eventStore'

const { locale } = useI18n()

const eventStore = useEventStore()

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = new Date()

const monthDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const selectedDate = ref(toDateKey(today))

const isEventModalOpen = ref(false)

const events = computed(() => eventStore.events)

const activeLocale = computed(() => {
  return locale.value === 'ar' ? 'ar-SY' : 'en-US'
})

const weekdays = computed(() => {
  if (locale.value === 'ar') {
    return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  }

  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
})

const monthTitle = computed(() => {
  return new Intl.DateTimeFormat(activeLocale.value, {
    month: 'long',
    year: 'numeric',
  }).format(monthDate.value)
})

const eventsByDate = computed(() => {
  return events.value.reduce((result, event) => {
    if (!result[event.date]) {
      result[event.date] = []
    }

    result[event.date].push(event)
    return result
  }, {})
})

const selectedEvents = computed(() => {
  return eventsByDate.value[selectedDate.value] || []
})

const selectedDateObject = computed(() => {
  return new Date(`${selectedDate.value}T12:00:00`)
})

const selectedLabel = computed(() => {
  return new Intl.DateTimeFormat(activeLocale.value, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(selectedDateObject.value)
})

const selectedShortDate = computed(() => {
  return new Intl.DateTimeFormat(activeLocale.value, {
    month: 'short',
    day: 'numeric',
  }).format(selectedDateObject.value)
})

const calendarDays = computed(() => {
  const year = monthDate.value.getFullYear()
  const month = monthDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const todayKey = toDateKey(new Date())

  const days = []

  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    days.push({
      isEmpty: true,
      dateKey: null,
      dayNumber: null,
    })
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day)
    const dateKey = toDateKey(date)

    days.push({
      isEmpty: false,
      dayNumber: day,
      dateKey,
      isToday: dateKey === todayKey,
    })
  }

  while (days.length % 7 !== 0) {
    days.push({
      isEmpty: true,
      dateKey: null,
      dayNumber: null,
    })
  }

  return days
})

function handleSelectDate(dateKey) {
  selectedDate.value = dateKey
}

function handlePreviousMonth() {
  const current = monthDate.value
  const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1)

  monthDate.value = newDate
  selectedDate.value = toDateKey(newDate)
}

function handleNextMonth() {
  const current = monthDate.value
  const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1)

  monthDate.value = newDate
  selectedDate.value = toDateKey(newDate)
}

function handleToday() {
  const today = new Date()

  monthDate.value = new Date(today.getFullYear(), today.getMonth(), 1)

  selectedDate.value = toDateKey(today)
}

function openEventModal() {
  isEventModalOpen.value = true
}

function closeEventModal() {
  isEventModalOpen.value = false
}

async function handleSaveEvent(eventData) {
  try {
    await eventStore.addEvent(eventData)

    selectedDate.value = eventData.date

    const eventDate = new Date(`${eventData.date}T12:00:00`)

    monthDate.value = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)

    closeEventModal()
  } catch (error) {
    console.error('Error saving event:', error)
  }
}

onMounted(async () => {
  try {
    await eventStore.fetchEvents()
  } catch (error) {
    console.error('Error loading events:', error)
  }
})
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div class="grid min-h-[720px] grid-cols-1 xl:grid-cols-[1fr_360px]">
      <section class="bg-slate-50 p-4 sm:p-6">
        <CalendarHeader
          :month-title="monthTitle"
          @previous="handlePreviousMonth"
          @next="handleNextMonth"
          @today="handleToday"
        />

        <CalendarGrid
          :days="calendarDays"
          :events-by-date="eventsByDate"
          :selected-date="selectedDate"
          :weekdays="weekdays"
          @select-date="handleSelectDate"
        />
      </section>

      <SelectedDayPanel
        :selected-label="selectedLabel"
        :selected-short-date="selectedShortDate"
        :events="selectedEvents"
        @add-event="openEventModal"
      />
    </div>
    <FloatingAddButton @click="openEventModal" />
    <EventModal
      :show="isEventModalOpen"
      :selected-date="selectedDate"
      @close="closeEventModal"
      @save="handleSaveEvent"
    />
  </div>
</template>