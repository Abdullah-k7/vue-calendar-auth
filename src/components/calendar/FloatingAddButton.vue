<script setup>
defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    @click="$emit('click')"
    class="fixed bottom-24 right-5 lg:bottom-6 lg:right-6 h-12 w-12 text-[24px] text-center pb-1 rounded-full bg-indigo-600  text-white text-3xl leading-none shadow-xl hover:bg-indigo-700 transition z-[2]"
  >
    +
  </button>
</template>