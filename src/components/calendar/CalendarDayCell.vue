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

const dayNumberClasses = computed(() => {
  if (props.selected) {
    return 'bg-indigo-600 text-white shadow-md'
  }

  if (props.day.isToday) {
    return 'border-2 border-indigo-600 text-indigo-700 bg-white'
  }

  return 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
})

function eventDotClass(event) {
  const colors = {
    indigo: 'bg-indigo-600',
    violet: 'bg-violet-600',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
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
    class="min-h-16 sm:min-h-20 w-full bg-white px-1 py-3 transition hover:bg-slate-50"
    :class="day.isEmpty ? 'cursor-default text-slate-300' : 'cursor-pointer'"
  >
    <template v-if="!day.isEmpty">
      <div class="flex justify-center">
        <span
          class="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition"
          :class="dayNumberClasses"
        >
          {{ day.dayNumber }}
        </span>
      </div>

      <div
        v-if="events.length"
        class="mt-2 flex justify-center gap-1"
      >
        <span
          v-for="event in events.slice(0, 3)"
          :key="event.id"
          class="h-1.5 w-1.5 rounded-full"
          :class="eventDotClass(event)"
        ></span>
      </div>
    </template>
  </button>
</template>