import { useState } from 'react'
import { useAppStore } from '../stores/appStore'

function TagManager() {
  const { tags, addTag, removeTag, updateTagColor, setShowTagManager } = useAppStore()
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [editingTag, setEditingTag] = useState<string | null>(null)

  const predefinedColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
  ]

  const handleAddTag = () => {
    if (newTagName.trim() && !tags.some(tag => tag.name === newTagName.trim())) {
      addTag(newTagName.trim(), newTagColor)
      setNewTagName('')
      setNewTagColor('#3b82f6')
    }
  }

  const handleRemoveTag = (tagName: string) => {
    if (window.confirm(`Remove tag "${tagName}"? This will remove it from all contacts.`)) {
      removeTag(tagName)
    }
  }

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="panel p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Tags</h2>
          <button
            onClick={() => setShowTagManager(false)}
            className="text-muted-dark hover:text-primary-dark"
          >
            ✕
          </button>
        </div>

        {/* Add new tag */}
        <div className="mb-6 p-4 bg-card-dark rounded-lg">
          <h3 className="font-medium mb-3">Add New Tag</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="input w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            
            <div>
              <p className="text-sm text-secondary-dark mb-2">Choose color:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTagColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Existing tags */}
        <div>
          <h3 className="font-medium mb-3">Existing Tags</h3>
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag.name} className="p-3 bg-card-dark rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      className="w-4 h-4 rounded-full border-2 border-transparent hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: tag.color }}
                      onClick={() => setEditingTag(editingTag === tag.name ? null : tag.name)}
                      title="Click to change color"
                    />
                    <span>{tag.name}</span>
                    <span className="text-sm text-secondary-dark">({tag.count} contacts)</span>
                  </div>
                  <button
                    onClick={() => handleRemoveTag(tag.name)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-400/10"
                  >
                    Remove
                  </button>
                </div>
                
                {/* Color picker for this tag */}
                {editingTag === tag.name && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-secondary-dark mb-2">Choose new color:</p>
                    <div className="flex flex-wrap gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            updateTagColor(tag.name, color)
                            setEditingTag(null)
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-colors ${
                            tag.color === color ? 'border-white' : 'border-gray-600 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {tags.length === 0 && (
              <p className="text-secondary-dark text-center py-4">No tags created yet</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => setShowTagManager(false)}
            className="btn-secondary flex-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TagManager