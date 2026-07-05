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
  <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <!-- Weekdays -->
    <div class="grid grid-cols-7 bg-indigo-50/70 border-b border-slate-200">
      <div
        v-for="day in weekdays"
        :key="day"
        class="h-11 flex items-center justify-center text-[11px] font-bold uppercase tracking-wide text-slate-600"
      >
        {{ day }}
      </div>
    </div>

    <!-- Days -->
    <div class="grid grid-cols-7 divide-x divide-y divide-slate-100">
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