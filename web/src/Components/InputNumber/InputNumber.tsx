import React, { ChangeEvent } from 'react'
import styles from './InputNumber.module.css'

interface InputNumberProps {
    value: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const InputNumber: React.FC<InputNumberProps> = ({ value, onChange }) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value: newValue } = event.target

        const standardizedValue = newValue.replace(/,/g, '.')
        if (standardizedValue.split('.').length > 2)
            return

        if (/^(\d+\.?\d*|\.\d+)$/.test(standardizedValue) || standardizedValue === '') {
            onChange({
                ...event,
                target: {
                    ...event.target,
                    value: standardizedValue
                }
            })
        }
    }

    return (
        <div className={styles.coinInput}>
            <input
                type="text"
                inputMode="decimal"
                min="0"
                value={value}
                onChange={handleChange}
                placeholder="0"
            />
        </div>
    )
}

export default InputNumber