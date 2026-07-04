<script setup>
defineProps({
  monthTitle: {
    type: String,
    required: true,
  },
})

defineEmits(['previous', 'next', 'today'])
</script>

<template>
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">
        {{ monthTitle }}
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Manage your monthly productivity
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="$emit('previous')"
        class="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      >
        ‹
      </button>

      <button
        @click="$emit('today')"
        class="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        Today
      </button>

      <button
        @click="$emit('next')"
        class="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      >
        ›
      </button>
    </div>
  </div>
</template>