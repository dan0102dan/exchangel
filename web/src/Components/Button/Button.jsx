import React from 'react'
import styles from './Button.module.css'

const Button = ({ children, onClick, loading, styleType, disabled }) => {
    return (
        <button
            className={styles[styleType ? styleType : 'button']}
            onClick={onClick}
            disabled={loading || disabled}
        >
            {loading ? 'Please wait...' : children}
        </button>
    )
}

export default Button