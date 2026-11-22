import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Kind = "success" | "error";
type Current = { kind: Kind; message: string; id: number };

type ToastApi = {
  success: (message: string, ms?: number) => void;
  error: (message: string, ms?: number) => void;
};

const noop = () => {};
const ToastContext = createContext<ToastApi>({ success: noop, error: noop });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Current | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const counter = useRef(0);

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setCurrent(null);
  }, []);

  const open = useCallback((kind: Kind, message: string, ms: number) => {
    window.clearTimeout(timer.current);
    counter.current += 1;
    setCurrent({ kind, message, id: counter.current });
    timer.current = window.setTimeout(() => setCurrent(null), ms);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, ms = 6000) => open("success", message, ms),
      error: (message, ms = 8000) => open("error", message, ms),
    }),
    [open]
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:justify-end">
        {current && (
          <button
            key={current.id}
            type="button"
            onClick={hide}
            role={current.kind === "error" ? "alert" : "status"}
            className={`toast-in pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-white shadow-lg ${
              current.kind === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            <span aria-hidden="true" className="mt-0.5 text-base leading-none">
              {current.kind === "success" ? "✓" : "!"}
            </span>
            <span>{current.message}</span>
          </button>
        )}
      </div>
    </ToastContext.Provider>
  );
}