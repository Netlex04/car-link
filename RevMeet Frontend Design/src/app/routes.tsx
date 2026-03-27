import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout';
import { HomePage } from './pages/home';
import { MeetsPage } from './pages/meets';
import { MeetDetailPage } from './pages/meet-detail';
import { MeetCreatePage } from './pages/meet-create';
import { VehiclesPage } from './pages/vehicles';
import { ProfilePage } from './pages/profile';
import { NotFoundPage } from './pages/not-found';

function Root() {
  return <Layout><HomePage /></Layout>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
  },
  {
    path: '/meets',
    Component: () => (
      <Layout>
        <MeetsPage />
      </Layout>
    ),
  },
  {
    path: '/meets/new',
    Component: () => (
      <Layout>
        <MeetCreatePage />
      </Layout>
    ),
  },
  {
    path: '/meets/:meetId',
    Component: () => (
      <Layout>
        <MeetDetailPage />
      </Layout>
    ),
  },
  {
    path: '/vehicles',
    Component: () => (
      <Layout>
        <VehiclesPage />
      </Layout>
    ),
  },
  {
    path: '/profile',
    Component: () => (
      <Layout>
        <ProfilePage />
      </Layout>
    ),
  },
  {
    path: '*',
    Component: () => (
      <Layout>
        <NotFoundPage />
      </Layout>
    ),
  },
]);