<script setup>
import { computed } from 'vue'

const props = defineProps({
  day: {
    type: Object,
    required: true,
  },
  events: {
    type: Array,
    default: () => [],
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const cellClasses = computed(() => {
  if (props.day.isEmpty) {
    return 'bg-transparent border-transparent cursor-default'
  }

  if (props.selected) {
    return 'bg-white border-indigo-600 ring-2 ring-indigo-200 shadow-sm'
  }

  return 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
})

function eventChipClass(event) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  return colors[event.color] || colors.indigo
}

function handleSelect() {
  if (props.day.isEmpty) return
  emit('select', props.day.dateKey)
}
</script>

<template>
  <button
    type="button"
    @click="handleSelect"
    class="min-h-28 rounded-2xl border p-3 text-left transition"
    :class="cellClasses"
  >
    <template v-if="!day.isEmpty">
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-semibold"
          :class="selected ? 'text-indigo-700' : 'text-slate-600'"
        >
          {{ day.dayNumber }}
        </span>

        <span
          v-if="day.isToday"
          class="h-2 w-2 rounded-full bg-indigo-600"
        ></span>
      </div>

      <div class="mt-3 space-y-1">
        <div
          v-for="event in events.slice(0, 2)"
          :key="event.id"
          class="truncate rounded-md border px-2 py-1 text-[10px] font-semibold"
          :class="eventChipClass(event)"
        >
          {{ event.title }}
        </div>

        <div
          v-if="events.length > 2"
          class="text-[10px] font-semibold text-slate-400"
        >
          +{{ events.length - 2 }} more
        </div>
      </div>
    </template>
  </button>
</template>