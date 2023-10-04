import React from 'react'
import styles from './InputNumber.module.css'

const InputNumber = ({ value, onChange }) => {
    return (
        <input
            type="number"
            pattern='[0-9]*'
            min="0"
            value={value}
            onChange={onChange}
            className={styles.coinInput}
            placeholder='Enter amount'
        />
    )
}

export default InputNumber