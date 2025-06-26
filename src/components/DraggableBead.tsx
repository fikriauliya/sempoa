import React, { useState } from 'react'
import { BeadPosition } from '../types'

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
    width: '24px',
    height: '16px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B4513 0%, #D2691E  30%, #CD853F  60%, #8B4513 100%)',
    border: '1px solid #654321',
    boxShadow: isActive 
      ? '0 2px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.1)'
      : '0 1px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.1)'
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
    />
  )
}

export default DraggableBead