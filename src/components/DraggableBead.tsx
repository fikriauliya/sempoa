import React, { useState, useRef } from 'react'
import { BeadPosition } from '../types'
import { SEMPOA_CONFIG } from '../config/sempoaConfig'

interface DraggableBeadProps {
  bead: BeadPosition
  isActive: boolean
  onClick: () => void
}

interface TouchInfo {
  startY: number
  startTime: number
}

const DraggableBead: React.FC<DraggableBeadProps> = ({ bead, isActive, onClick }) => {
  const [isDragging, setIsDragging] = useState(false)
  const touchInfo = useRef<TouchInfo | null>(null)

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
    
    const touch = e.touches[0]
    touchInfo.current = {
      startY: touch.clientY,
      startTime: Date.now()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (!touchInfo.current) {
      onClick()
      return
    }

    const touch = e.changedTouches[0]
    const endY = touch.clientY
    const endTime = Date.now()
    
    const deltaY = touchInfo.current.startY - endY // Positive = swipe up, Negative = swipe down
    const deltaTime = endTime - touchInfo.current.startTime
    const distance = Math.abs(deltaY)
    const velocity = distance / deltaTime // pixels per millisecond
    
    // Swipe detection thresholds
    const MIN_SWIPE_DISTANCE = 30 // pixels
    const MIN_SWIPE_VELOCITY = 0.1 // pixels per millisecond (100px/s)
    
    // Check if this qualifies as a swipe gesture
    if (distance >= MIN_SWIPE_DISTANCE && velocity >= MIN_SWIPE_VELOCITY) {
      // Handle swipe gesture
      handleSwipeGesture(deltaY > 0 ? 'up' : 'down')
    } else {
      // Fallback to tap behavior
      onClick()
    }
    
    touchInfo.current = null
  }

  const handleSwipeGesture = (_direction: 'up' | 'down') => {
    // For swipe gestures, we treat them as enhanced tap behavior
    // Both swipe up and swipe down trigger the same onClick behavior
    // The abacus logic in the parent component handles activation/deactivation properly
    // This maintains authentic abacus behavior while adding intuitive gesture support
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