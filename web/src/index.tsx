import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider
} from 'react-router-dom'
import { AppProvider } from './Components/index'
import { ErrorPage, Root, Swap } from './routes/index'
import './index.css'

// Create a router instance with defined routes
const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/ccy/:instId',
    element: <Swap />,
    errorElement: <ErrorPage />,
  }
])

// Render the router within the application's root element
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>
)

// Configure the BackButton behavior
const BackButton = (window as any).Telegram.WebApp.BackButton
BackButton.onClick(() => router.navigate(-1))
router.subscribe((state) => {
  if (state.matches.at(0)?.pathname === '/')
    BackButton.hide()
  else
    BackButton.show()
})