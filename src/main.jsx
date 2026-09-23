import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ListingsProvider } from './context/ListingsContext'
import { SwipesProvider } from './context/SwipesContext'
import { BookmarksProvider } from './context/BookmarksContext'
import { PropertiesProvider } from './context/PropertiesContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ListingsProvider>
          <SwipesProvider>
            <BookmarksProvider>
              <PropertiesProvider>
                <App />
              </PropertiesProvider>
            </BookmarksProvider>
          </SwipesProvider>
        </ListingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
