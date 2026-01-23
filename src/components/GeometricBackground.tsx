'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTheme } from './ThemeProvider'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

export default function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationFrameRef = useRef<number>()
  const { theme } = useTheme()

  const initNodes = useCallback((width: number, height: number) => {
    const nodeCount = Math.floor((width * height) / 15000) // Adjust density
    const nodes: Node[] = []

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2.0,
        vy: (Math.random() - 0.5) * 2.0,
      })
    }

    nodesRef.current = nodes
  }, [])

  const drawNetwork = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const nodes = nodesRef.current
    const connectionDistance = 150
    const isDark = theme === 'dark'

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Update node positions
    nodes.forEach((node) => {
      node.x += node.vx
      node.y += node.vy

      // Bounce off edges
      if (node.x < 0 || node.x > width) node.vx *= -1
      if (node.y < 0 || node.y > height) node.vy *= -1

      // Keep within bounds
      node.x = Math.max(0, Math.min(width, node.x))
      node.y = Math.max(0, Math.min(height, node.y))
    })

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.5
          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(nodes[j].x, nodes[j].y)
          ctx.strokeStyle = isDark 
            ? `rgba(156, 163, 175, ${opacity})` 
            : `rgba(107, 114, 128, ${opacity})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = isDark 
        ? 'rgba(156, 163, 175, 0.8)' 
        : 'rgba(107, 114, 128, 0.8)'
      ctx.fill()
    })
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initNodes(canvas.width, canvas.height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const animate = () => {
      drawNetwork(ctx, canvas.width, canvas.height)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [initNodes, drawNetwork])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  )
}
