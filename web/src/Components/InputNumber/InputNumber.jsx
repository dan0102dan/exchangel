import React from 'react'
import styles from './InputNumber.module.css'

const InputNumber = ({ value, onChange }) => {
    return (
        <input
            type="number"
            inputMode="decimal"
            min="0"
            value={value}
            onChange={onChange}
            className={styles.coinInput}
            placeholder='0'
        />
    )
}

export default InputNumber