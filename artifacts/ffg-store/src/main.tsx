import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { auth } from "./lib/firebase";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Wire up Firebase ID token as Bearer token for all API calls.
// When auth is not configured, the getter returns null and no header is sent.
setAuthTokenGetter(() => auth?.currentUser?.getIdToken() ?? null);

createRoot(document.getElementById("root")!).render(<App />);
