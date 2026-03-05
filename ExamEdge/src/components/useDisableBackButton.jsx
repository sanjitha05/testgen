import { useEffect } from "react";

function useDisableBackButton() {
  useEffect(() => {
    // Push current state
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}

export default useDisableBackButton;
