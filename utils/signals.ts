import { signal } from "@preact/signals";

// Signal for the current user logged in
export const usernameSignal = signal<string>("");
export const isAdminSignal = signal<boolean>(false);
export const isMenuExpanded = signal<boolean>(true);
