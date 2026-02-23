import { useEffect, useRef } from "react";
import { useProblem } from "../context/ProblemContext";
import { gsap } from "gsap";

export default function ValueDisplay({ value }) {
  const ref = useRef();
  const { problem } = useProblem(); // get live problem from context

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { scale: 0.5, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.25,
        ease: "back.out(2)"
      }
    );
  }, [problem]); // only run when problem changes

  return (
    <div ref={ref} className="value-display">
      {value}
    </div>
  );
}
