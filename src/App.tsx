import React, { useState, useEffect, useCallback } from 'react'
import './App.css'

const MAX_TRIES = 6
const GUESS_WORD = ['b', 'a', 'n', 'a', 'n', 'a']

type TMatch = {
  char: string
  index: number
}

function fillHintWordArray(word: string[]) {
  return word.map((_) => '_')
}

function uniqueCharactersArray(arr: string[]): string[] {
  const uniqueSet = new Set(arr)

  return [...uniqueSet]
}

function fillHintWordGuess(matches: TMatch[], hint: string[]) {
  const newHint = [...hint]

  matches.forEach((match) => {
    newHint[match.index] = match.char
  })

  return newHint
}

function drawHangman(mistakes: number): string {
  const head = mistakes >= 1 ? 'O' : ' '
  const body = mistakes >= 2 ? '|' : ' '
  const leftArm = mistakes >= 3 ? '/' : ' '
  const rightArm = mistakes >= 4 ? '\\' : ' '
  const leftLeg = mistakes >= 5 ? '/' : ' '
  const rightLeg = mistakes >= 6 ? '\\' : ' '

  const hangmanArt = `
  ________
  |      |
  |      ${head}
  |     ${leftArm}${body}${rightArm}
  |     ${leftLeg} ${rightLeg}
  `

  return hangmanArt
}

type TGameStates = 'play' | 'lose' | 'win'
type TGameStateControllerProps = {
  state: TGameStates
  children?: React.ReactNode
  handleRestart: () => void
}

function GameStateController({
  handleRestart,
  state,
  children,
}: TGameStateControllerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
      }}>
      {state === 'win' || state === 'lose' ? (
        <>
          <h3>You {state}!</h3>
          <button onClick={handleRestart}>Play Again?</button>
        </>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}

function App() {
  const [gameState, setGameState] = useState<TGameStates>('play')
  const [keyPressed, setKeyPressed] = useState<string | null>(null)
  const [tries, setTries] = useState<string[]>([])
  const [hint, setHint] = useState(fillHintWordArray(GUESS_WORD))
  const [remainingChars, setRemainingChars] = useState<string[]>(
    uniqueCharactersArray(GUESS_WORD)
  )

  const handleKeyDown = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (gameState !== 'play') {
        return
      }

      const regex = /^[a-zA-Z0-9]$/

      const key = event.key

      if (regex.test(key)) {
        if (!remainingChars.includes(key)) {
          setTries((prev) => uniqueCharactersArray([...prev, key]))
          if (tries.length + 1 >= MAX_TRIES) {
            setGameState('lose')
          }
          return
        }

        const matches = GUESS_WORD.reduce((acc, char, index) => {
          if (char === key) {
            acc.push({
              char,
              index,
            })
          }

          return acc
        }, [] as TMatch[])

        setRemainingChars((prev) => {
          return prev.filter((char) => char !== key)
        })

        setHint((prev) => {
          const newHint = fillHintWordGuess(matches, prev)

          console.log('WIN CHECK', {
            hint,
            GUESS_WORD,
            dbg: {
              hintJoin: hint.join(''),
              guessJoin: GUESS_WORD.join(''),
            },
          })
          if (newHint.join('') === GUESS_WORD.join('')) {
            setGameState('win')
          }

          return newHint
        })

        setKeyPressed(event.key)
      } else {
        setKeyPressed(null)
      }
    },
    [gameState, tries, hint]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const handleReset = () => {
    setGameState('play')
    setKeyPressed(null)
    setTries([])
    setHint(fillHintWordArray(GUESS_WORD))
    setRemainingChars(uniqueCharactersArray(GUESS_WORD))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
      }}>
      <h1>Hang Game</h1>
      <h2>Try to guess the word by typing a letter</h2>
      <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
        {drawHangman(tries.length)}
      </pre>
      <div style={{ display: 'flex', gap: '4px' }}>
        {hint.map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>

      <GameStateController state={gameState} handleRestart={handleReset}>
        <h3>You've typed:</h3>
        <h2>{keyPressed}</h2>

        <h4>
          Tries:
          <span>
            <b>{tries.length}</b>
          </span>
        </h4>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            maxWidth: '300px',
          }}>
          {tries.map((char, index) => (
            <span key={`${char}-${index}`}>{char}</span>
          ))}
        </div>
      </GameStateController>
    </div>
  )
}

export default App
