// polyfills for IE 11
import "core-js/stable";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainProgram from "./components/MainProgram";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MainProgram />
    </QueryClientProvider>
  </StrictMode>,
);
