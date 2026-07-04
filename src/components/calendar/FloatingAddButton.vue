<script setup>
defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    @click="$emit('click')"
    class="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 text-white text-3xl leading-none shadow-xl hover:bg-indigo-700 transition z-20"
  >
    +
  </button>
</template>