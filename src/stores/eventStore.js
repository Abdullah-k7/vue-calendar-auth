import { defineStore } from 'pinia'

import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,

} from 'firebase/firestore'

import { db, auth } from '@/firebase/firebase'

function buildReminderAt(date, time, reminderMinutes) {
    if (!date || !time || reminderMinutes == null) {
        return null
    }

    const eventDate = new Date(
        `${date}T${time}:00+03:00`
    )

    const reminderDate = new Date(
        eventDate.getTime() -
        Number(reminderMinutes) * 60 * 1000
    )

    return Timestamp.fromDate(reminderDate)
}

export const useEventStore = defineStore('events', {
    state: () => ({
        events: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchEvents() {
            this.error = null
            this.loading = true

            try {
                const user = auth.currentUser

                if (!user) {
                    throw new Error('You must be logged in.')
                }

                const eventsCollection = collection(
                    db,
                    'users',
                    user.uid,
                    'events'
                )

                const querySnapshot = await getDocs(eventsCollection)

                this.events = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async addEvent(eventData) {
            this.error = null
            this.loading = true

            try {
                const user = auth.currentUser

                if (!user) {
                    throw new Error('You must be logged in.')
                }

                const eventsCollection = collection(
                    db,
                    'users',
                    user.uid,
                    'events'
                )

                const reminderAt = buildReminderAt(
                    eventData.date,
                    eventData.time,
                    eventData.reminderMinutes
                )

                const docRef = await addDoc(eventsCollection, {
                    title: eventData.title,
                    date: eventData.date,
                    time: eventData.time || '',
                    subtitle: eventData.subtitle || '',
                    color: eventData.color || 'indigo',

                    reminderMinutes:
                        eventData.reminderMinutes ?? null,

                    reminderAt,

                    notificationSent: false,

                    timezone: 'Asia/Damascus',

                    createdAt: serverTimestamp(),
                })

                const newEvent = {
                    id: docRef.id,
                    title: eventData.title,
                    date: eventData.date,
                    time: eventData.time || '',
                    subtitle: eventData.subtitle || '',
                    color: eventData.color || 'indigo',

                    reminderMinutes:
                        eventData.reminderMinutes ?? null,

                    reminderAt,

                    notificationSent: false,
                }

                this.events.push(newEvent)

                return newEvent
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteEvent(eventId) {
            this.error = null

            try {
                const user = auth.currentUser

                if (!user) {
                    throw new Error('You must be logged in.')
                }

                const eventRef = doc(
                    db,
                    'users',
                    user.uid,
                    'events',
                    eventId
                )

                await deleteDoc(eventRef)

                this.events = this.events.filter(
                    (event) => event.id !== eventId
                )
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async updateEvent(eventId, eventData) {
            this.error = null
            this.loading = true

            try {
                const user = auth.currentUser

                if (!user) {
                    throw new Error('You must be logged in.')
                }

                const eventRef = doc(
                    db,
                    'users',
                    user.uid,
                    'events',
                    eventId
                )

                const reminderAt = buildReminderAt(
                    eventData.date,
                    eventData.time,
                    eventData.reminderMinutes
                )

                await updateDoc(eventRef, {
                    title: eventData.title,
                    date: eventData.date,
                    time: eventData.time || '',
                    subtitle: eventData.subtitle || '',
                    color: eventData.color || 'indigo',

                    reminderMinutes:
                        eventData.reminderMinutes ?? null,

                    reminderAt,

                    notificationSent: false,

                    timezone: 'Asia/Damascus',

                    updatedAt: serverTimestamp(),
                })

                this.events = this.events.map((event) => {
                    if (event.id === eventId) {
                        return {
                            ...event,

                            title: eventData.title,
                            date: eventData.date,
                            time: eventData.time || '',
                            subtitle: eventData.subtitle || '',
                            color: eventData.color || 'indigo',

                            reminderMinutes:
                                eventData.reminderMinutes ?? null,

                            reminderAt,

                            notificationSent: false,
                        }
                    }

                    return event
                })
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteAllEvents() {
            this.error = null

            try {
                const user = auth.currentUser

                if (!user) {
                    throw new Error('You must be logged in.')
                }

                const eventsCollection = collection(
                    db,
                    'users',
                    user.uid,
                    'events'
                )

                const snapshot = await getDocs(eventsCollection)

                await Promise.all(
                    snapshot.docs.map((eventDoc) =>
                        deleteDoc(eventDoc.ref)
                    )
                )

                this.events = []
            } catch (error) {
                this.error = error.message
                throw error
            }
        },
    },
})