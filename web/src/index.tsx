import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider
} from 'react-router-dom'
import { AppProvider, LocalizationProvider } from './Components/index'
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

// Configure the BackButton behavior
const BackButton = (window as any).Telegram.WebApp.BackButton
BackButton.onClick(() => window.history.length > 1
  ? router.navigate(-1)
  : router.navigate('/')
)

router.subscribe((state) => {
  const isRoot = state.matches.at(0)?.pathname === '/'

  isRoot ? BackButton.hide() : BackButton.show()
})

// Render the router within the application's root element
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <LocalizationProvider>
        <RouterProvider router={router} />
      </LocalizationProvider>
    </AppProvider>
  </React.StrictMode>
)