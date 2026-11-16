import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const SCROLL_THRESHOLD = 320;

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const shouldBeVisible = window.scrollY > SCROLL_THRESHOLD;
      setIsVisible((currentVisibility) =>
        currentVisibility === shouldBeVisible
          ? currentVisibility
          : shouldBeVisible,
      );
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-1 hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 sm:bottom-8 sm:right-8"
    >
      <FaArrowUp aria-hidden="true" />
    </button>
  );
};

export default ScrollToTopButton;
