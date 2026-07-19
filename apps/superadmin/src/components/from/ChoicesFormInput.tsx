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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && choicesRef.current && typeof window !== 'undefined') {
      // Dynamically import and initialize Choices.js
      import("choices.js").then((ChoicesModule) => {
        const ChoicesClass = ChoicesModule.default;
        if (choicesRef.current) {
          const choices = new ChoicesClass(choicesRef.current, {
            ...options,
            placeholder: true,
            allowHTML: true,
            shouldSort: false,
          });
          choices.passedElement.element.addEventListener("change", (e: Event) => {
            if (!(e.target instanceof HTMLSelectElement)) return;
            if (onChange) {
              onChange(e.target.value);
            }
          });
        }
      }).catch(() => {
        // Fallback if Choices.js fails to load
        console.warn("Choices.js failed to load, using native select");
      });
    }
  }, [mounted, options, onChange]);

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
