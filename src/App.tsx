import { GameProvider } from './context/GameContext'
import SempoaBoard from './components/SempoaBoard'
import GameController from './components/GameController'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Sempoa Learning App
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SempoaBoard />
            </div>
            <div className="lg:col-span-1">
              <GameController />
            </div>
          </div>
        </div>
      </div>
    </GameProvider>
  )
}

export default App