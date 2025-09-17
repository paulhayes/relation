import { useState } from 'react'
import { useAppStore } from '../stores/appStore'

function TagLegend() {
  const { tags, toggleTag, setShowTagManager } = useAppStore()
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="panel bg-panel-dark/95 backdrop-blur-sm w-64">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between w-full p-3 text-left hover:bg-card-dark rounded-lg transition-colors"
        >
          <span className="font-medium text-primary-dark">Tags</span>
          <span className={`text-secondary-dark transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}>
            ▶
          </span>
        </button>
        
        {!isCollapsed && (
          <div className="p-3 pt-0">
            <div className="space-y-2">
              {tags.map((tag) => (
                <div 
                  key={tag.name}
                  className="flex items-center justify-between cursor-pointer hover:bg-card-dark p-2 rounded"
                  onClick={() => toggleTag(tag.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color, opacity: tag.visible ? 1 : 0.3 }}
                    />
                    <span className={tag.visible ? '' : 'text-muted-dark line-through'}>
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-secondary-dark">{tag.count}</span>
                    <div className={`w-4 h-4 border rounded ${tag.visible ? 'bg-blue-600 border-blue-600' : 'border-gray-600'} flex items-center justify-center`}>
                      {tag.visible && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-800">
              <button 
                className="btn-secondary w-full text-sm"
                onClick={() => setShowTagManager(true)}
              >
                Manage Tags
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TagLegend