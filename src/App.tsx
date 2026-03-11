import { getInitialLessonState } from './state/reducer'
import { FractionBlock } from './components/Workspace/FractionBlock'

function App() {
  const state = getInitialLessonState()
  const block = state.blocks[0]

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Synthesis Tutor</h1>
      <p>Fraction equivalence lesson — scaffold ready.</p>
      {block && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <FractionBlock block={block} referenceWidth={200} />
        </div>
      )}
    </div>
  )
}

export default App
