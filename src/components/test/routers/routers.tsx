import { Router } from '@remix-run/router';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '../pages/layout';

export const router: Router = createBrowserRouter([{ path: '/', element: <Layout /> }]);

const elements = (
  <>
    <RouterProvider router={router} />
  </>
);

export default elements;
