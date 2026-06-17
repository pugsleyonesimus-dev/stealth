/**
 * useVendorTracker
 *
 * Folder-local state hook that drives the Vendor Mail Tracker.
 * Loads from the fixture JSON, applies actions, and exposes derived state.
 * No network requests — all state is in-memory for this isolated workspace.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type {
  StatusFilter,
  ThreadAction,
  ThreadNote,
  ThreadStatus,
  VendorThread,
} from "../components/types";

// ─── State shape ──────────────────────────────────────────────────────────────

type LoadState = "idle" | "loading" | "ready" | "error";

interface TrackerState {
  threads: VendorThread[];
  loadState: LoadState;
  errorMessage: string;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type ReducerAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; threads: VendorThread[] }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "APPLY"; action: ThreadAction };

function reducer(state: TrackerState, event: ReducerAction): TrackerState {
  switch (event.type) {
    case "LOAD_START":
      return { ...state, loadState: "loading", errorMessage: "" };

    case "LOAD_SUCCESS":
      return { threads: event.threads, loadState: "ready", errorMessage: "" };

    case "LOAD_ERROR":
      return { ...state, loadState: "error", errorMessage: event.message };

    case "APPLY": {
      const { action } = event;
      switch (action.type) {
        case "set-status":
          return {
            ...state,
            threads: state.threads.map((t) =>
              t.id === action.threadId ? { ...t, status: action.status } : t,
            ),
          };

        case "set-owner":
          return {
            ...state,
            threads: state.threads.map((t) =>
              t.id === action.threadId ? { ...t, owner: action.owner } : t,
            ),
          };

        case "toggle-flag":
          return {
            ...state,
            threads: state.threads.map((t) =>
              t.id === action.threadId ? { ...t, flagged: !t.flagged } : t,
            ),
          };

        case "add-note":
          return {
            ...state,
            threads: state.threads.map((t) =>
              t.id === action.threadId
                ? { ...t, notes: [...t.notes, action.note] }
                : t,
            ),
          };

        case "delete-note":
          return {
            ...state,
            threads: state.threads.map((t) =>
              t.id === action.threadId
                ? { ...t, notes: t.notes.filter((n) => n.id !== action.noteId) }
                : t,
            ),
          };

        default:
          return state;
      }
    }

    default:
      return state;
  }
}

const initialState: TrackerState = {
  threads: [],
  loadState: "idle",
  errorMessage: "",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVendorTracker() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const loadRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load fixture data once on mount
  useEffect(() => {
    if (loadRef.current) return;
    loadRef.current = true;

    dispatch({ type: "LOAD_START" });

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          new URL(
            "../fixtures/sample-vendor-threads.json",
            import.meta.url,
          ).href,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        dispatch({ type: "LOAD_SUCCESS", threads: json.threads as VendorThread[] });
      } catch (err) {
        dispatch({
          type: "LOAD_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Could not load vendor thread fixtures.",
        });
      }
    }, 600);

    return () => {
      clearTimeout(t);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // ── Derived: filtered list ─────────────────────────────────────────────────

  const filteredThreads =
    activeFilter === "all"
      ? state.threads
      : state.threads.filter((t) => t.status === activeFilter);

  const selectedThread =
    state.threads.find((t) => t.id === selectedThreadId) ?? null;

  // ── Actions ───────────────────────────────────────────────────────────────

  const applyAction = useCallback((action: ThreadAction) => {
    dispatch({ type: "APPLY", action });
  }, []);

  const setStatus = useCallback(
    (threadId: string, status: ThreadStatus) =>
      applyAction({ type: "set-status", threadId, status }),
    [applyAction],
  );

  const setOwner = useCallback(
    (threadId: string, owner: string) =>
      applyAction({ type: "set-owner", threadId, owner }),
    [applyAction],
  );

  const toggleFlag = useCallback(
    (threadId: string) => applyAction({ type: "toggle-flag", threadId }),
    [applyAction],
  );

  const addNote = useCallback(
    (threadId: string, note: ThreadNote) =>
      applyAction({ type: "add-note", threadId, note }),
    [applyAction],
  );

  const deleteNote = useCallback(
    (threadId: string, noteId: string) =>
      applyAction({ type: "delete-note", threadId, noteId }),
    [applyAction],
  );

  const retry = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    loadRef.current = false;
    dispatch({ type: "LOAD_START" });

    retryTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          new URL(
            "../fixtures/sample-vendor-threads.json",
            import.meta.url,
          ).href,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        dispatch({ type: "LOAD_SUCCESS", threads: json.threads as VendorThread[] });
      } catch (err) {
        dispatch({
          type: "LOAD_ERROR",
          message: err instanceof Error ? err.message : "Retry failed.",
        });
      }
    }, 400);
  }, []);

  return {
    // State
    threads: state.threads,
    filteredThreads,
    loadState: state.loadState,
    errorMessage: state.errorMessage,
    activeFilter,
    selectedThread,
    selectedThreadId,

    // Filter / selection
    setActiveFilter,
    selectThread: setSelectedThreadId,

    // Thread actions
    setStatus,
    setOwner,
    toggleFlag,
    addNote,
    deleteNote,
    retry,
  };
}
