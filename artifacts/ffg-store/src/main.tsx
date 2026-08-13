import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { defaultBannerImgUrl } from "./lib/default-hero";

// Discover LCP image as early as possible (default hero WebP).
const preload = document.createElement("link");
preload.rel = "preload";
preload.as = "image";
preload.href = defaultBannerImgUrl;
preload.type = "image/webp";
document.head.appendChild(preload);

createRoot(document.getElementById("root")!).render(<App />);
