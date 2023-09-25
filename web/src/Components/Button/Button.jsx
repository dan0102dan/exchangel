import React from 'react'
import styles from './Button.module.css'

const Button = ({ children, onClick, disabled }) => {
    return (
        <button
            className={`${styles.button} ${disabled ? styles.disabled : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default Button