<script setup>
import CalendarDayCell from './CalendarDayCell.vue'

defineProps({
  days: {
    type: Array,
    required: true,
  },
  eventsByDate: {
    type: Object,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  weekdays: {
    type: Array,
    required: true,
  },
})

defineEmits(['selectDate'])
</script>

<template>
  <div>
    <div class="grid grid-cols-7 gap-3 mb-3">
      <div
        v-for="day in weekdays"
        :key="day"
        class="text-center text-[11px] font-bold uppercase tracking-wide text-slate-400"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-3">
      <CalendarDayCell
        v-for="(day, index) in days"
        :key="day.dateKey || `empty-${index}`"
        :day="day"
        :events="day.dateKey ? eventsByDate[day.dateKey] || [] : []"
        :selected="selectedDate === day.dateKey"
        @select="$emit('selectDate', $event)"
      />
    </div>
  </div>
</template>