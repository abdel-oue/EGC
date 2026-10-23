"use client";

import { useEffect, useRef, useState } from "react";

// Fades/slides children in the first time they scroll into view.
// from: "up" | "left" | "right" | "zoom". Stagger with Tailwind delay-* classes in className.
export default function Reveal({ as: Tag = "div", from = "up", className = "", children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-from={from} data-shown={shown} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
