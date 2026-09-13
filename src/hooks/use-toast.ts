"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Listener = (state: State) => void;

interface State {
  toasts: ToasterToast[];
}

let memoryState: State = { toasts: [] };
const listeners: Listener[] = [];

function dispatch(action: {
  type: "ADD" | "DISMISS" | "REMOVE";
  toast?: ToasterToast;
  id?: string;
}) {
  switch (action.type) {
    case "ADD":
      memoryState = {
        toasts: [action.toast as ToasterToast, ...memoryState.toasts].slice(
          0,
          TOAST_LIMIT,
        ),
      };
      break;
    case "DISMISS":
      memoryState = {
        toasts: memoryState.toasts.filter((t) => t.id !== action.id),
      };
      break;
    case "REMOVE":
      memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== action.id) };
      break;
  }
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToasterToast, "id">;

function toast(props: Toast) {
  const id = genId();
  dispatch({ type: "ADD", toast: { ...props, id } });
  const timeout = setTimeout(() => dispatch({ type: "DISMISS", id }), 4000);
  return {
    id,
    dismiss: () => {
      clearTimeout(timeout);
      dispatch({ type: "DISMISS", id });
    },
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (id: string) => dispatch({ type: "DISMISS", id }),
  };
}

export { useToast, toast };
