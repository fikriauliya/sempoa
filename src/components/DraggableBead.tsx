import React, { useState } from 'react'
import { BeadPosition } from '../types'
import { SEMPOA_CONFIG } from '../config/sempoaConfig'

interface DraggableBeadProps {
  bead: BeadPosition
  isActive: boolean
  onClick: () => void
}

const DraggableBead: React.FC<DraggableBeadProps> = ({ bead, isActive, onClick }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', JSON.stringify(bead))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(false)
    onClick()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
  }

  const baseClasses = `cursor-pointer transition-all duration-300 hover:scale-105 shadow-md`
  const activeClasses = isActive 
    ? 'shadow-lg'
    : 'hover:shadow-lg'
  
  const dragClasses = isDragging ? 'opacity-50' : ''
  
  const beadStyle = {
    width: `${SEMPOA_CONFIG.BEAD.WIDTH}px`,
    height: `${SEMPOA_CONFIG.BEAD.HEIGHT}px`,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2C1810 0%, #8B4513 20%, #D2691E 40%, #CD853F 60%, #8B4513 80%, #2C1810 100%)',
    border: '1px solid #1A0F0A',
    boxShadow: isActive 
      ? '0 3px 10px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(0,0,0,0.3), inset 3px 3px 6px rgba(255,255,255,0.1)'
      : '0 2px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.1)',
    position: 'relative' as const,
  }

  const holeStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${SEMPOA_CONFIG.BEAD.HOLE_SIZE}px`,
    height: `${SEMPOA_CONFIG.BEAD.HOLE_SIZE}px`,
    borderRadius: '50%',
    background: 'radial-gradient(circle, #000 0%, #333 50%, #000 100%)',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`${baseClasses} ${activeClasses} ${dragClasses}`}
      style={beadStyle}
      onClick={onClick}
    >
      <div style={holeStyle} />
    </div>
  )
}

export default DraggableBead