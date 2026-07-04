<script setup>
defineProps({
  selectedLabel: {
    type: String,
    required: true,
  },
  selectedShortDate: {
    type: String,
    required: true,
  },
  events: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['add-event'])

function eventCardClass(event) {
  const colors = {
    indigo: 'bg-indigo-600 text-white',
    violet: 'bg-violet-600 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
  }

  return colors[event.color] || colors.indigo
}
</script>

<template>
  <aside class="h-full bg-white border-l border-slate-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-sm font-bold text-slate-900">
          Selected Day
        </h2>

        <p class="text-xs text-slate-500 mt-1">
          {{ selectedLabel }}
        </p>
      </div>

      <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
        {{ selectedShortDate }}
      </span>
    </div>

    <div v-if="events.length" class="space-y-4">
      <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Upcoming Events
      </p>

      <div
        v-for="event in events"
        :key="event.id"
        class="rounded-2xl p-4 shadow-sm"
        :class="eventCardClass(event)"
      >
        <p class="text-xs font-semibold opacity-80">
          {{ event.time || 'All day' }}
        </p>

        <h3 class="mt-1 text-sm font-bold leading-snug">
          {{ event.title }}
        </h3>

        <p v-if="event.subtitle" class="mt-1 text-xs opacity-80">
          {{ event.subtitle }}
        </p>
      </div>

      <button
        type="button"
        @click="$emit('add-event')"
        class="w-full rounded-xl bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
      >
        Add another event
      </button>
    </div>

    <div
      v-else
      class="mt-20 flex flex-col items-center justify-center text-center"
    >
      <div class="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
        🗓️
      </div>

      <h3 class="mt-4 text-sm font-bold text-slate-800">
        No events scheduled
      </h3>

      <p class="mt-1 max-w-52 text-xs text-slate-500">
        Enjoy your free time or plan ahead.
      </p>

      <button
        type="button"
        @click="$emit('add-event')"
        class="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
      >
        Add Event
      </button>
    </div>
  </aside>
</template>