// src/components/ui/OtpInput.jsx
// ─────────────────────────────────────────────────────────────
// 6-box OTP input with:
//   - Auto-advance: typing a digit moves focus to the next box
//   - Backspace:    deletes current digit and moves focus back
//   - Paste:        pasting "123456" fills all boxes at once
//   - Numeric only: ignores non-digit keypresses
//   - Accessibility: single labelled group with individual inputs
//
// Usage:
//   const [otp, setOtp] = useState('')
//   <OtpInput value={otp} onChange={setOtp} error={errors.otp} />
//
// onChange receives the full OTP string (e.g. "123456")
// ─────────────────────────────────────────────────────────────

import { useRef } from 'react'
import { OTP_LENGTH } from '@/config/constants'

/**
 * OtpInput
 *
 * @param {Object} props
 * @param {string}   props.value       - Full OTP string (e.g. "1234  " or "123456")
 * @param {Function} props.onChange    - Called with the updated full OTP string
 * @param {string}   [props.error]     - Error message shown below
 * @param {boolean}  [props.disabled]
 * @param {number}   [props.length]    - Number of boxes (default: OTP_LENGTH = 6)
 */
export function OtpInput({
  value    = '',
  onChange,
  error,
  disabled = false,
  length   = OTP_LENGTH,
}) {
  // Array of refs, one per input box — used for programmatic focus
  const inputRefs = useRef(Array.from({ length }, () => null))

  // Normalise value to an array of individual characters (padded with '' for empty slots)
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  /**
   * updateValue — called whenever any box changes.
   * Builds the full string and calls onChange.
   *
   * @param {number} index - Which box changed
   * @param {string} char  - The new single character (or '' for delete)
   */
  function updateValue(index, char) {
    const newDigits = [...digits]
    newDigits[index] = char
    onChange(newDigits.join(''))
  }

  /**
   * handleKeyDown — manages backspace navigation.
   * Backspace on an empty box → delete the previous box's value and move focus back.
   */
  function handleKeyDown(e, index) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Box has a value — clear it (let onChange handle via handleChange)
        updateValue(index, '')
      } else if (index > 0) {
        // Box is empty — move focus to previous box and clear it
        updateValue(index - 1, '')
        inputRefs.current[index - 1]?.focus()
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      e.preventDefault()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      e.preventDefault()
    }
  }

  /**
   * handleChange — processes a single digit input.
   * Only accepts numeric input (0-9), then advances focus.
   */
  function handleChange(e, index) {
    const raw = e.target.value

    // Filter to only the last entered digit (some Android keyboards send multi-char)
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit) return

    updateValue(index, digit)

    // Auto-advance to next box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  /**
   * handlePaste — fills all boxes from a pasted string.
   * e.g. pasting "123456" populates all 6 boxes.
   */
  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return

    onChange(pasted.padEnd(length, '').slice(0, length))

    // Move focus to the last filled box (or last box if all filled)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  /**
   * handleFocus — selects the input text when focused (for easy re-entry).
   */
  function handleFocus(e) {
    e.target.select()
  }

  const hasError = !!error

  return (
    <div>
      {/* OTP boxes */}
      <div
        role="group"
        aria-label="One-time password"
        style={{
          display:       'flex',
          gap:           10,
          justifyContent: 'center',
        }}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            autoFocus={index === 0}
            aria-label={`Digit ${index + 1} of ${length}`}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            style={{
              width:         48,
              height:        56,
              textAlign:     'center',
              fontSize:      '1.35rem',
              fontWeight:    600,
              fontFamily:    'var(--font-mono)',
              color:         'var(--text-primary)',
              background:    'var(--bg-input)',
              border:        `1.5px solid ${
                hasError       ? 'var(--danger)'  :
                digit          ? 'var(--accent)'  :
                                 'var(--border-default)'
              }`,
              borderRadius:  'var(--radius-sm)',
              outline:       'none',
              transition:    'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s',
              boxShadow:     digit && !hasError
                               ? '0 0 0 3px var(--accent-light)'
                               : hasError
                                 ? '0 0 0 3px var(--danger-light)'
                                 : 'none',
              transform:     digit ? 'scale(1.05)' : 'scale(1)',
              cursor:        disabled ? 'not-allowed' : 'text',
              opacity:       disabled ? 0.6 : 1,

              // Remove default number input arrows (Firefox)
              MozAppearance: 'textfield',
            }}
          />
        ))}
      </div>

      {/* Error message */}
      {hasError && (
        <p
          style={{
            fontSize:  '0.75rem',
            color:     'var(--danger)',
            textAlign: 'center',
            marginTop:  8,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default OtpInput
