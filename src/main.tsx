import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

createRoot(document.getElementById("root")!).render(
  <AppWrapper>
    <App />
  </AppWrapper>
);
