import { StrictMode, Suspense } from 'react'
import './App.css'


const App = () => {
  return (
    <StrictMode>
        <Suspense
            fallback={
                <>
                    <p>Loading styles...</p>
                </>
            }>
            <p>
                TODO
            </p>
        </Suspense>
    </StrictMode>
  )
}

export default App
