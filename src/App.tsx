import { getInitialLessonState } from './state/reducer'
import { Workspace } from './components/Workspace/Workspace'

function App() {
  const state = getInitialLessonState()

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Synthesis Tutor</h1>
      <p>Fraction equivalence lesson — scaffold ready.</p>
      <div style={{ marginTop: '1rem' }}>
        <Workspace blocks={state.blocks} referenceWidth={300} />
      </div>
    </div>
  )
}

export default App
