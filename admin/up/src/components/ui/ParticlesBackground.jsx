import { useCallback, useMemo } from 'react'
import Particles from '@tsparticles/react'
import { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useEffect, useState } from 'react'

const ParticlesBackground = () => {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = useCallback(async () => {}, [])

  const options = useMemo(
    () => ({
      fullScreen: {
        enable: true,
        zIndex: 0,
      },
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 120,
      detectRetina: true,
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: {
            enable: true,
            mode: 'grab',
          },
          onClick: {
            enable: true,
            mode: 'push',
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 160,
            links: {
              opacity: 0.22,
            },
          },
          push: {
            quantity: 2,
          },
        },
      },
      particles: {
        color: {
          value: ['#14b8a6', '#06b6d4', '#8b5cf6'],
        },
        links: {
          color: '#38bdf8',
          distance: 140,
          enable: true,
          opacity: 0.14,
          width: 1,
        },
        move: {
          angle: {
            offset: 0,
            value: 90,
          },
          attract: {
            enable: false,
          },
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out',
          },
          random: true,
          speed: 0.8,
          straight: false,
          trail: {
            enable: false,
          },
        },
        number: {
          density: {
            enable: true,
            area: 900,
          },
          value: 55,
        },
        opacity: {
          value: { min: 0.08, max: 0.35 },
          animation: {
            enable: true,
            speed: 0.6,
            minimumValue: 0.08,
            sync: false,
          },
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 4 },
          animation: {
            enable: true,
            speed: 3,
            minimumValue: 0.8,
            sync: false,
          },
        },
      },
    }),
    [],
  )

  if (!init) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-90">
      <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />
    </div>
  )
}

export default ParticlesBackground