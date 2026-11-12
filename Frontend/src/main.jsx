import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store, persistor } from './store/store.js'
import App from './App.jsx'
import { Spinner } from './components/ui/Spinner.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate
          loading={
            <div className="flex min-h-screen items-center justify-center bg-white">
              <Spinner className="h-12 w-12" />
            </div>
          }
          persistor={persistor}
        >
          <App />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)
