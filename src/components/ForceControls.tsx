import { useState } from 'react'
import { useAppStore } from '../stores/appStore'

interface ForceControlsProps {
  onForceChange: (forces: ForceSettings) => void
}

export interface ForceSettings {
  springConstant: number
  unconnectedRepulsion: number
  connectedIdealDistance: number
  centerStrength: number
  damping: number
  maxVelocity: number
  visualizeConnections: boolean
}

const defaultForces: ForceSettings = {
  springConstant: 2.0,
  unconnectedRepulsion: 0.1,
  connectedIdealDistance: 3.0,
  centerStrength: 0.02,
  damping: 0.95,
  maxVelocity: 5,
  visualizeConnections: true
}

function ForceControls({ onForceChange }: ForceControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [forces, setForces] = useState<ForceSettings>(defaultForces)

  const handleForceChange = (key: keyof ForceSettings, value: number | boolean) => {
    const newForces = { ...forces, [key]: value }
    setForces(newForces)
    onForceChange(newForces)
  }

  const resetToDefaults = () => {
    setForces(defaultForces)
    onForceChange(defaultForces)
  }

  return (
    <div className="absolute top-20 right-4 z-10">
      <div className="panel bg-panel-dark/95 backdrop-blur-sm w-64">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between w-full p-3 text-left hover:bg-card-dark rounded-lg transition-colors"
        >
          <span className="font-medium text-primary-dark">Force Controls</span>
          <span className={`text-secondary-dark transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}>
            ▶
          </span>
        </button>
        
        {!isCollapsed && (
          <div className="p-3 pt-0 space-y-4">
            {/* Spring Constant */}
            <div>
              <label className="block text-sm text-secondary-dark mb-1">
                Spring Strength
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={forces.springConstant}
                  onChange={(e) => handleForceChange('springConstant', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-muted-dark w-8 text-right">
                  {forces.springConstant.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-dark mt-1">How strongly springs pull/push toward Unconnected repulsion</p>
            </div>

            { /*Unconnected repulsion for Unconnected*/ }
            <div>
              <label className="block text-sm text-secondary-dark mb-1">
                Unconnected Repulsion
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="0.3"
                  step="0.01"
                  value={forces.unconnectedRepulsion}
                  onChange={(e) => handleForceChange('unconnectedRepulsion', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-muted-dark w-8 text-right">
                  {forces.unconnectedRepulsion.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-dark mt-1">Unconnected repulsion between unrelated nodes</p>
            </div>

            {/* Unconnected repulsion for Connected */}
            <div>
              <label className="block text-sm text-secondary-dark mb-1">
                Connected Distance
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  value={forces.connectedIdealDistance}
                  onChange={(e) => handleForceChange('connectedIdealDistance', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-muted-dark w-8 text-right">
                  {forces.connectedIdealDistance.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-dark mt-1">Unconnected repulsion between nodes with shared tags</p>
            </div>

            {/* Center Attraction */}
            <div>
              <label className="block text-sm text-secondary-dark mb-1">
                Center Gravity
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={forces.centerStrength}
                  onChange={(e) => handleForceChange('centerStrength', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-muted-dark w-12 text-right">
                  {forces.centerStrength.toFixed(3)}
                </span>
              </div>
              <p className="text-xs text-muted-dark mt-1">Pull toward center to prevent drift</p>
            </div>

            {/* Damping */}
            <div>
              <label className="block text-sm text-secondary-dark mb-1">
                Damping
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0.8"
                  max="0.99"
                  step="0.01"
                  value={forces.damping}
                  onChange={(e) => handleForceChange('damping', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-muted-dark w-12 text-right">
                  {forces.damping.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-dark mt-1">Velocity decay (higher = less friction)</p>
            </div>

            {/* Max Velocity */}
            <div>
              <label className="block text-sm text-secondary-dark mb-1">
                Max Velocity
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={forces.maxVelocity}
                  onChange={(e) => handleForceChange('maxVelocity', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-muted-dark w-8 text-right">
                  {forces.maxVelocity.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-dark mt-1">Speed limit to prevent instability</p>
            </div>

            {/* Visualize Connections */}
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="visualizeConnections"
                  checked={forces.visualizeConnections}
                  onChange={(e) => handleForceChange('visualizeConnections', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-panel-dark border border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="visualizeConnections" className="text-sm text-secondary-dark cursor-pointer">
                  Visualize Connections
                </label>
              </div>
              <p className="text-xs text-muted-dark mt-1">Show connection lines between nodes with shared tags</p>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetToDefaults}
              className="btn-secondary w-full text-sm py-2"
            >
              Reset to Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForceControls