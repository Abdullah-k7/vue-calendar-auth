import { defineStore } from 'pinia'

import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore'

import { db, auth } from '@/firebase/firebase'

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

                const docRef = await addDoc(eventsCollection, {
                    title: eventData.title,
                    date: eventData.date,
                    time: eventData.time || '',
                    subtitle: eventData.subtitle || '',
                    color: eventData.color || 'indigo',
                    createdAt: serverTimestamp(),
                })

                const newEvent = {
                    id: docRef.id,
                    title: eventData.title,
                    date: eventData.date,
                    time: eventData.time || '',
                    subtitle: eventData.subtitle || '',
                    color: eventData.color || 'indigo',
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

                await updateDoc(eventRef, {
                    title: eventData.title,
                    date: eventData.date,
                    time: eventData.time || '',
                    subtitle: eventData.subtitle || '',
                    color: eventData.color || 'indigo',
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
    },
})