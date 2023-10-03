import React from 'react'
import styles from './InputNumber.module.css'

const InputNumber = ({ value, onChange }) => {
    return (
        <input
            type="number"
            min="0"
            value={value}
            onChange={onChange}
            className={styles.coinInput}
            placeholder='Enter amount'
        />
    )
}

export default InputNumber