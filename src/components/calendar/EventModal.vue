<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },

  selectedDate: {
    type: String,
    required: true,
  },

  editingEvent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const localError = ref('')

const form = reactive({
  title: '',
  date: props.selectedDate,
  time: '',
  subtitle: '',
  color: 'indigo',
  reminderMinutes: '',
})

watch(
  () => props.selectedDate,
  (newDate) => {
    form.date = newDate
  }
)

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) return

    localError.value = ''

    if (props.editingEvent) {
      form.title = props.editingEvent.title
      form.date = props.editingEvent.date
      form.time = props.editingEvent.time || ''
      form.subtitle = props.editingEvent.subtitle || ''
      form.color = props.editingEvent.color || 'indigo'
      form.reminderMinutes = props.editingEvent.reminderMinutes ?? ''
    } else {
      form.title = ''
      form.date = props.selectedDate
      form.time = ''
      form.subtitle = ''
      form.color = 'indigo'
      form.reminderMinutes = ''
    }
  }
)
function handleSubmit() {
  localError.value = ''

  if (!form.title.trim()) {
    localError.value = 'Please enter an event title.'
    return
  }

  if (!form.date) {
    localError.value = 'Please select a date.'
    return
  }
  if (form.reminderMinutes !== '' && !form.time) {
    localError.value = 'Please select a time to use a reminder.'
    return
  }

  emit('save', {
    title: form.title.trim(),
    date: form.date,
    time: form.time,
    subtitle: form.subtitle.trim(),
    color: form.color,

    reminderMinutes: form.reminderMinutes === '' ? null : Number(form.reminderMinutes),
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">
              {{ editingEvent ? 'Edit Event' : 'Add Event' }}
            </h2>
            <p class="text-sm text-slate-500 mt-1">
              {{
                editingEvent
                  ? 'Update your event details.'
                  : 'Create a new event for your calendar.'
              }}
            </p>
          </div>

          <button
            type="button"
            @click="$emit('close')"
            class="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700"> Event Title </label>

            <input
              v-model="form.title"
              type="text"
              placeholder="Example: Team meeting"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-semibold text-slate-700"> Date </label>

              <input
                v-model="form.date"
                type="date"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-semibold text-slate-700"> Time </label>

              <input
                v-model="form.time"
                type="time"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700"> Reminder </label>

            <select
              v-model="form.reminderMinutes"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No reminder</option>
              <option :value="5">5 minutes before</option>
              <option :value="10">10 minutes before</option>
              <option :value="15">15 minutes before</option>
              <option :value="30">30 minutes before</option>
              <option :value="60">1 hour before</option>
              <option :value="1440">1 day before</option>
            </select>

            <p class="mt-1 text-xs text-slate-400">Choose when you want to be notified.</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700"> Description </label>

            <textarea
              v-model="form.subtitle"
              rows="3"
              placeholder="Write event details..."
              class="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700"> Color </label>

            <select
              v-model="form.color"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="indigo">Indigo</option>
              <option value="violet">Violet</option>
              <option value="blue">Blue</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
            </select>
          </div>

          <div
            v-if="localError"
            class="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
          >
            {{ localError }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="$emit('close')"
              class="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {{ editingEvent ? 'Update Event' : 'Save Event' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>