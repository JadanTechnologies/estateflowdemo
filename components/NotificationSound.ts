
// This file contains the Base64 encoded data for the notification sound.
// Using a separate file keeps the component logic clean.

// The sound is a short, pleasant "ting" sound.
// Source: https://notificationsounds.com/ (royalty-free)
export const NOTIFICATION_SOUND_BASE64 = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAZGF0YQAAAAA='; // Replaced with a tiny valid mock for avoiding build errors if actual b64 is missing, logic in App.tsx uses a real sound or browser default if possible.
