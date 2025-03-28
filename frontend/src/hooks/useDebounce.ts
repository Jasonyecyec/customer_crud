import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay Delay in milliseconds before updating the value.
 */
const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
