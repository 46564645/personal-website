import LetterGlitch from './components/LetterGlitch-JS-CSS/LetterGlitch';

export default function App() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <LetterGlitch
        glitchColors={['#5227FF']}
        glitchSpeed={40}
        centerVignette={false}
        outerVignette={false}
        smooth
      />
    </div>
  );
}
