import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import './index.css'

import { ErrorPage, Root, Swap } from "./routes/index"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'ccy/:instId',
    element: <Swap />
  }
], { basename: '/exchangel' })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

router.subscribe((state) => {
  const BackButton = (window as any).Telegram.WebApp.BackButton

  if (state.matches.at(0)?.pathname === '/')
    BackButton.hide()
  else {
    BackButton.onClick(() => router.navigate(-1))
    BackButton.show()
  }
})