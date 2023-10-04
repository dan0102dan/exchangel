import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
} from 'react-router-dom'
import './index.css'

import { ErrorPage, Root, Swap } from "./routes/index"

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/ccy/:instId',
    element: <Swap />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

const BackButton = (window as any).Telegram.WebApp.BackButton
BackButton.onClick(() => router.navigate(-1))
router.subscribe((state) => {
  if (state.matches.at(0)?.pathname === '/')
    BackButton.hide()
  else
    BackButton.show()
})