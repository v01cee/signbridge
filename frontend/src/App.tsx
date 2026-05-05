import { Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { GestureDetailPage } from "./pages/GestureDetailPage";
import { CreateGesturePage } from "./pages/CreateGesturePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: "#f0506e", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          <h2>💥 React Error</h2>
          <p>{(this.state.error as Error).message}</p>
          <p style={{ fontSize: 12, color: "#8b8fa8" }}>{(this.state.error as Error).stack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gestures/:id" element={<GestureDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateGesturePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
