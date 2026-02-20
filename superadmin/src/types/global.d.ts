// Custom extensions to built-in types
declare global {
  interface Date {
    toRelativeTime(): string;
  }
}

export {};
