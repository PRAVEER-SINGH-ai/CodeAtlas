import { useEffect, useRef, useState } from "react";

export default function InteractiveSurface({
  as: Tag = "div",
  intensity = "medium",
  className = "",
  children,
  ...props
}) {
  const [phase, setPhase] = useState("");
  const timerRef = useRef(null);

  const activate = () => {
    clearTimeout(timerRef.current);
    setPhase("fire");
  };

  const deactivate = () => {
    clearTimeout(timerRef.current);
    setPhase("ice");

    timerRef.current = setTimeout(() => {
      setPhase("");
    }, intensity === "large" ? 1100 : intensity === "medium" ? 800 : 450);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <Tag
      {...props}
      tabIndex={props.tabIndex ?? (Tag === "div" ? 0 : undefined)}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      className={[
        "interactive-surface",
        `interactive-${intensity}`,
        phase,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="interactive-surface__content">{children}</span>
    </Tag>
  );
}