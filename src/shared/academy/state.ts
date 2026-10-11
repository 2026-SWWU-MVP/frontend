import { useSyncExternalStore } from 'react'

import { getAcademy } from '@/entities/academy/api/repository'
import type { Academy } from './academy'

import { getStoredAcademy, saveAcademy } from './academy'

export type AcademyLoadStatus = 'idle' | 'loading' | 'success' | 'error'

interface AcademyState {
  status: AcademyLoadStatus
  error: unknown | null
}

const states = new Map<number, AcademyState>()
const inFlight = new Map<number, Promise<Academy>>()
const listeners = new Set<() => void>()
const idleState: AcademyState = { status: 'idle', error: null }

function notify() {
  listeners.forEach((listener) => listener())
}

function setState(userId: number, state: AcademyState) {
  states.set(userId, state)
  notify()
}

export function getAcademyState(userId: number | null): AcademyState {
  if (userId === null) return idleState
  const current = states.get(userId)
  if (current) return current

  const initialState: AcademyState = {
    status: getStoredAcademy(userId) ? 'success' : 'idle',
    error: null,
  }
  states.set(userId, initialState)
  return initialState
}

export function loadAcademy(userId: number, options: { force?: boolean } = {}) {
  const cached = getStoredAcademy(userId)
  if (cached && !options.force) {
    setState(userId, { status: 'success', error: null })
    return Promise.resolve(cached)
  }

  const existing = inFlight.get(userId)
  if (existing) return existing

  setState(userId, { status: 'loading', error: null })
  const request = getAcademy(userId)
    .then((academy) => {
      saveAcademy(userId, academy)
      setState(userId, { status: 'success', error: null })
      return academy
    })
    .catch((error: unknown) => {
      setState(userId, { status: 'error', error })
      throw error
    })
    .finally(() => {
      inFlight.delete(userId)
    })

  inFlight.set(userId, request)
  return request
}

export function retryAcademy(userId: number) {
  return loadAcademy(userId, { force: true })
}

export function useAcademyState(userId: number | null) {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => getAcademyState(userId),
    () => ({ status: 'idle' as const, error: null }),
  )
}
