export type BookingSettings = {
  openHour: number
  closeHour: number
  slotDuration: number
  peakStartHour: number
  lowHourPrice: number
  peakHourPrice: number
}

export type TimeSlot = {
  id: string
  label: string
  start: number
  end: number
}

export const SETTINGS_STORAGE_KEY = "bookingSettings"

export const DEFAULT_SETTINGS: BookingSettings = {
  openHour: 5,
  closeHour: 23,
  slotDuration: 2,
  peakStartHour: 17,
  lowHourPrice: 39000,
  peakHourPrice: 59000,
}

export function sanitizeSettings(settings: BookingSettings): BookingSettings {
  const openHour = Math.max(0, Math.min(23, settings.openHour))
  const closeHour = Math.max(openHour + 1, Math.min(24, settings.closeHour))
  const slotDuration = Math.max(1, Math.min(4, settings.slotDuration))
  const peakStartHour = Math.max(openHour, Math.min(closeHour, settings.peakStartHour))

  return {
    openHour,
    closeHour,
    slotDuration,
    peakStartHour,
    lowHourPrice: Math.max(0, settings.lowHourPrice),
    peakHourPrice: Math.max(0, settings.peakHourPrice),
  }
}

export function generateTimeSlots(settings: BookingSettings): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let start = settings.openHour; start + settings.slotDuration <= settings.closeHour; start += settings.slotDuration) {
    const end = start + settings.slotDuration
    slots.push({
      id: `${start}-${end}`,
      label: `${start}:00 - ${end}:00`,
      start,
      end,
    })
  }
  return slots
}

export function getPrice(slotId: string, slots: TimeSlot[], settings: BookingSettings): number {
  const slot = slots.find((item) => item.id === slotId)
  if (!slot) return 0

  let total = 0
  for (let hour = slot.start; hour < slot.end; hour += 1) {
    total += hour >= settings.peakStartHour ? settings.peakHourPrice : settings.lowHourPrice
  }
  return total
}

export function getSlotLabel(slotId: string | null, slots: TimeSlot[]): string {
  if (!slotId) return ""
  return slots.find((item) => item.id === slotId)?.label ?? slotId
}

export function loadSettings(): BookingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!raw) return DEFAULT_SETTINGS

  try {
    return sanitizeSettings(JSON.parse(raw) as BookingSettings)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: BookingSettings): BookingSettings {
  const normalized = sanitizeSettings(settings)
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
  }
  return normalized
}

export function resetSettings(): BookingSettings {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
  }
  return DEFAULT_SETTINGS
}
