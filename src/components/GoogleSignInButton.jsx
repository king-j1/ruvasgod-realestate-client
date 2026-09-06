import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services";

function GoogleSignInButton({ onCredential, onError }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      return undefined;
    }

    const renderButton = () => {
      if (!containerRef.current || !window.google?.accounts?.id) {
        return;
      }

      containerRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => onCredential(credential),
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
      });
      setReady(true);
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      renderButton();
      return undefined;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = onError;
    document.head.appendChild(script);

    return undefined;
  }, [clientId, onCredential, onError]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="min-h-10 text-center">
      {!ready && <span className="text-sm text-slate-500">Loading Google sign-in...</span>}
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}

export default GoogleSignInButton;
