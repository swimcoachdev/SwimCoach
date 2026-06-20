import { create } from "zustand";
import type { NewWorkoutState, SetEntry, DrylandEntry, AttendeeEntry } from "@/types/workout";

interface NewWorkoutStore extends NewWorkoutState {
  setDate: (date: string) => void;
  setGroupId: (id: string) => void;
  setSets: (sets: SetEntry[]) => void;
  setDryland: (d: DrylandEntry | null) => void;
  setAttendees: (a: AttendeeEntry[]) => void;
  toggleAttendee: (swimmer_id: string) => void;
  setOverrideM: (swimmer_id: string, m: number | undefined) => void;
  setNotes: (n: string) => void;
  reset: () => void;
}

const today = new Date().toISOString().split("T")[0];

const defaults: NewWorkoutState = {
  date: today,
  group_id: "",
  sets: [],
  dryland: null,
  attendees: [],
  notes: "",
};

export const useNewWorkoutStore = create<NewWorkoutStore>((set) => ({
  ...defaults,
  setDate: (date) => set({ date }),
  setGroupId: (group_id) => set({ group_id }),
  setSets: (sets) => set({ sets }),
  setDryland: (dryland) => set({ dryland }),
  setAttendees: (attendees) => set({ attendees }),
  toggleAttendee: (swimmer_id) =>
    set((s) => ({
      attendees: s.attendees.map((a) =>
        a.swimmer_id === swimmer_id ? { ...a, present: !a.present } : a
      ),
    })),
  setOverrideM: (swimmer_id, m) =>
    set((s) => ({
      attendees: s.attendees.map((a) =>
        a.swimmer_id === swimmer_id ? { ...a, actual_pool_m: m } : a
      ),
    })),
  setNotes: (notes) => set({ notes }),
  reset: () => set({ ...defaults, date: new Date().toISOString().split("T")[0] }),
}));
