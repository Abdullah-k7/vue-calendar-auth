<script setup>
import { computed, onMounted, ref } from 'vue'
import { useEventStore } from '@/stores/eventStore'
import EventModal from '@/components/calendar/EventModal.vue'

const eventStore = useEventStore()
const isEditModalOpen = ref(false)
const editingEvent = ref(null)

onMounted(async () => {
  try {
    if (eventStore.events.length === 0) {
      await eventStore.fetchEvents()
    }
  } catch (error) {
    console.error('Error loading events:', error)
  }
})

const sortedEvents = computed(() => {
  return [...eventStore.events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`)
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`)

    return dateA - dateB
  })
})

async function handleDelete(eventId) {
  const confirmed = window.confirm('Are you sure you want to delete this event?')

  if (!confirmed) return

  try {
    await eventStore.deleteEvent(eventId)
  } catch (error) {
    console.error('Error deleting event:', error)
  }
}

function openEditModal(event) {
  editingEvent.value = event
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingEvent.value = null
}

async function handleUpdateEvent(eventData) {
  if (!editingEvent.value) return

  try {
    await eventStore.updateEvent(editingEvent.value.id, eventData)

    closeEditModal()
  } catch (error) {
    console.error('Error updating event:', error)
  }
}
</script>

<template>
  <div v-if="eventStore.loading" class="py-12 text-center text-sm text-slate-500">
    Loading events...
  </div>

  <div v-else-if="!sortedEvents.length" class="py-12 text-center">
    <div
      class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl"
    >
      🗓️
    </div>

    <h2 class="mt-4 font-bold text-slate-800">No events yet</h2>

    <p class="mt-1 text-sm text-slate-500">Add an event from your calendar.</p>
  </div>

  <div v-else class="space-y-3">
    <div
      v-for="event in sortedEvents"
      :key="event.id"
      class="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm"
    >
      <div class="flex items-start justify-between gap-4">
        <h2 class="font-bold text-slate-900">
          {{ event.title }}
        </h2>

        <span
          class="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 text-nowrap flex"
        >
          {{ event.date }}
        </span>
      </div>
      <p v-if="event.subtitle" class="mt-1 text-sm text-slate-500">
        {{ event.subtitle }}
      </p>

      <div class="flex items-center justify-between gap-4 mt-3 text-sm text-slate-600">
        <div>
          <p>
            {{ event.time || 'All day' }}
          </p>
          <p v-if="event.reminderMinutes" class="mt-1 text-xs text-indigo-500">
            🔔
            {{
              event.reminderMinutes === 1440
                ? '1 day before'
                : event.reminderMinutes === 60
                ? '1 hour before'
                : `${event.reminderMinutes} minutes before`
            }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Edit -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
            title="Edit event"
            @click="openEditModal(event)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-4 w-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 3.487a2.25 2.25 0 013.182 3.182L7.5 19.213 3 21l1.787-4.5L16.862 3.487z"
              />
            </svg>
          </button>

          <!-- Delete -->
          <button
            type="button"
            @click="handleDelete(event.id)"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition"
            title="Delete event"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-4 w-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5M14 11v5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <EventModal
    :show="isEditModalOpen"
    :selected-date="editingEvent?.date || ''"
    :editing-event="editingEvent"
    @close="closeEditModal"
    @save="handleUpdateEvent"
  />
</template>

