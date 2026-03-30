import { createBrowserRouter, useRouteError } from "react-router";
import { Layout } from "./components/layout";
import { HomePage } from "./pages/home";
import { MeetsPage } from "./pages/meets";

function ErrorBoundary() {
  const error = useRouteError();
  console.error("Route error:", error);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-destructive">Fehler geladen</h1>
      <p className="mt-4 text-base text-foreground/80">
        Etwas ist schiefgelaufen. Bitte Seite neu laden oder später erneut
        versuchen.
      </p>
      <pre className="mt-4 overflow-auto rounded bg-muted p-4 text-xs text-foreground/80">
        {String(error)}
      </pre>
    </div>
  );
}

import { MeetDetailPage } from "./pages/meet-detail";
import { MeetCreatePage } from "./pages/meet-create";
import { VehiclesPage } from "./pages/vehicles";
import { ProfilePage } from "./pages/profile";
import { NotFoundPage } from "./pages/not-found";

function Root() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/meets",
    Component: () => (
      <Layout>
        <MeetsPage />
      </Layout>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/meets/new",
    Component: () => (
      <Layout>
        <MeetCreatePage />
      </Layout>
    ),
  },
  {
    path: "/meets/:meetId",
    Component: () => (
      <Layout>
        <MeetDetailPage />
      </Layout>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/vehicles",
    Component: () => (
      <Layout>
        <VehiclesPage />
      </Layout>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/profile",
    Component: () => (
      <Layout>
        <ProfilePage />
      </Layout>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    Component: () => (
      <Layout>
        <NotFoundPage />
      </Layout>
    ),
    errorElement: <ErrorBoundary />,
  },
]);
