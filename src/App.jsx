import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import LetterGlitch from './components/LetterGlitch.jsx';
import './components/TrueFocus.css';

const greetings = {
  left: 'print("Hi, I\'m ma zhichao")',
  right: 'print("Welcome to my website")'
};

const phases = {
  scanShort: 1050,
  scanLong: 1050,
  scanNear: 750,
  reveal: 1400,
  focusIn: 420,
  hold: 3000,
  exit: 650
};

const getPhase = elapsed => {
  if (elapsed < phases.scanShort) return 'scan-short';
  if (elapsed < phases.scanShort + phases.scanLong) return 'scan-long';
  if (elapsed < phases.scanShort + phases.scanLong + phases.scanNear) return 'scan-near';
  if (elapsed < phases.scanShort + phases.scanLong + phases.scanNear + phases.reveal) return 'reveal';
  if (elapsed < phases.scanShort + phases.scanLong + phases.scanNear + phases.reveal + phases.focusIn) return 'focus';
  if (elapsed < phases.scanShort + phases.scanLong + phases.scanNear + phases.reveal + phases.focusIn + phases.hold) return 'hold';
  return 'exit';
};

export default function App() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState('scan-short');
  const [focusMetrics, setFocusMetrics] = useState(null);
  const side = cycle % 2 === 0 ? 'left' : 'right';
  const greeting = greetings[side];

  const cycleDuration = useMemo(
    () =>
      phases.scanShort +
      phases.scanLong +
      phases.scanNear +
      phases.reveal +
      phases.focusIn +
      phases.hold +
      phases.exit,
    []
  );

  useEffect(() => {
    const startedAt = Date.now();

    const phaseTimer = window.setInterval(() => {
      setPhase(getPhase(Date.now() - startedAt));
    }, 80);

    const cycleTimer = window.setTimeout(() => {
      setCycle(current => current + 1);
      setPhase('scan-short');
    }, cycleDuration);

    return () => {
      window.clearInterval(phaseTimer);
      window.clearTimeout(cycleTimer);
    };
  }, [cycle, cycleDuration]);

  const isFocused = phase === 'focus' || phase === 'hold';
  const isExiting = phase === 'exit';
  const isScanning = phase === 'scan-short' || phase === 'scan-long' || phase === 'scan-near';
  const isRevealing = phase === 'reveal';
  const showFocusFrame = focusMetrics && (isScanning || isRevealing || isFocused || isExiting);
  const handleEmbeddedMetrics = useCallback(metrics => {
    setFocusMetrics(previous => {
      if (
        previous &&
        metrics &&
        previous.x === metrics.x &&
        previous.y === metrics.y &&
        previous.width === metrics.width &&
        previous.height === metrics.height &&
        previous.text === metrics.text
      ) {
        return previous;
      }

      return metrics;
    });
  }, []);

  return (
    <main className={`homepage is-${phase}`}>
      <div className="glitch-field">
        <LetterGlitch
          glitchColors={['#310033', '#be06c7', '#620165']}
          glitchSpeed={40}
          centerVignette={false}
          outerVignette={false}
          smooth
          embeddedText={greeting}
          embeddedSide={side}
          embeddedPhase={phase}
          embeddedCycle={cycle}
          revealDuration={phases.reveal}
          onEmbeddedMetrics={handleEmbeddedMetrics}
        />
      </div>

      {showFocusFrame && (
        <>
          <div className={`focus-blur-layer ${isExiting ? 'is-exiting' : ''}`} aria-hidden="true">
            <motion.div
              className="focus-blur-panel"
              animate={{
                x: 0,
                y: 0,
                width: '100vw',
                height: focusMetrics.y,
                opacity: isExiting ? 0 : 1
              }}
              transition={{ duration: isRevealing ? phases.reveal / 1000 : isScanning ? 0.24 : 0.36 }}
            />
            <motion.div
              className="focus-blur-panel"
              animate={{
                x: 0,
                y: focusMetrics.y + focusMetrics.height,
                width: '100vw',
                height: `calc(100vh - ${focusMetrics.y + focusMetrics.height}px)`,
                opacity: isExiting ? 0 : 1
              }}
              transition={{ duration: isRevealing ? phases.reveal / 1000 : isScanning ? 0.24 : 0.36 }}
            />
            <motion.div
              className="focus-blur-panel"
              animate={{
                x: 0,
                y: focusMetrics.y,
                width: focusMetrics.x,
                height: focusMetrics.height,
                opacity: isExiting ? 0 : 1
              }}
              transition={{ duration: isRevealing ? phases.reveal / 1000 : isScanning ? 0.24 : 0.36 }}
            />
            <motion.div
              className="focus-blur-panel"
              animate={{
                x: focusMetrics.x + focusMetrics.width,
                y: focusMetrics.y,
                width: `calc(100vw - ${focusMetrics.x + focusMetrics.width}px)`,
                height: focusMetrics.height,
                opacity: isExiting ? 0 : 1
              }}
              transition={{ duration: isRevealing ? phases.reveal / 1000 : isScanning ? 0.24 : 0.36 }}
            />
          </div>

          <motion.section
            className={`greeting-focus is-visible ${isFocused ? 'is-locked' : ''} ${isExiting ? 'is-exiting' : ''}`}
            animate={{
              x: focusMetrics.x,
              y: focusMetrics.y,
              width: focusMetrics.width,
              height: focusMetrics.height,
              opacity: isExiting ? 0 : 1
            }}
            transition={{ duration: isRevealing ? phases.reveal / 1000 : isScanning ? 0.24 : 0.36 }}
            aria-label={greeting}
          >
            <span className="corner top-left"></span>
            <span className="corner top-right"></span>
            <span className="corner bottom-left"></span>
            <span className="corner bottom-right"></span>
          </motion.section>
        </>
      )}
    </main>
  );
}
