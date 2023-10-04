import React from 'react'
import styles from './InputNumber.module.css'

const InputNumber = ({ value, onChange }) => {
    return (
        <div className={styles.coinInput}>
            <input
                type="number"
                inputMode="decimal"
                min="0"
                value={value}
                onChange={onChange}
                placeholder='0'
            />
        </div>
    )
}

export default InputNumber