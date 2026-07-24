"use client";
import {
  type HTMLAttributes,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";

export type ChoiceProps = HTMLAttributes<HTMLInputElement> &
  HTMLAttributes<HTMLSelectElement> & {
    multiple?: boolean;
    className?: string;
    options?: any;
    onChange?: (text: string) => void;
  } & (
    | {
        allowInput?: false;
        children: ReactElement[];
      }
    | { allowInput?: true }
  );

const ChoicesFormInput = ({
  children,
  multiple,
  className,
  onChange,
  allowInput,
  options,
  ...props
}: ChoiceProps) => {
  const choicesRef = useRef<HTMLInputElement & HTMLSelectElement>(null);
  const choicesInstanceRef = useRef<{ destroy: () => void } | null>(null);
  const onChangeRef = useRef(onChange);
  const optionsRef = useRef(options);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mounted || !choicesRef.current || typeof window === "undefined") return;

    const element = choicesRef.current;
    let disposed = false;
    let choices: {
      destroy: () => void;
      passedElement: { element: HTMLInputElement | HTMLSelectElement };
    } | null = null;
    let boundElement: HTMLInputElement | HTMLSelectElement | null = null;

    const handleChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
      onChangeRef.current?.(target.value);
    };

    void import("choices.js")
      .then((ChoicesModule) => {
        if (disposed || choicesRef.current !== element || choicesInstanceRef.current) return;

        const ChoicesClass = ChoicesModule.default;
        choices = new ChoicesClass(element, {
          ...optionsRef.current,
          placeholder: true,
          allowHTML: true,
          shouldSort: false,
        });
        choicesInstanceRef.current = choices;
        boundElement = choices.passedElement.element;
        boundElement.addEventListener("change", handleChange);
      })
      .catch(() => {
        if (!disposed) console.warn("Choices.js failed to load, using native select");
      });

    return () => {
      disposed = true;
      boundElement?.removeEventListener("change", handleChange);
      choices?.destroy();
      if (choicesInstanceRef.current === choices) choicesInstanceRef.current = null;
    };
  }, [mounted]);

  if (!mounted) {
    // Return a simple select/input during SSR
    return allowInput ? (
      <input
        multiple={multiple}
        className={className}
        {...props}
      />
    ) : (
      <select
        multiple={multiple}
        className={className}
        {...props}
      >
        {children}
      </select>
    );
  }

  return allowInput ? (
    <input
      ref={choicesRef}
      multiple={multiple}
      className={className}
      {...props}
    />
  ) : (
    <select
      ref={choicesRef}
      multiple={multiple}
      className={className}
      {...props}
    >
      {children}
    </select>
  );
};

export default ChoicesFormInput;
