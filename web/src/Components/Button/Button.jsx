import React from 'react'
import styles from './Button.module.css'

const Button = ({ children, onClick, styleType }) => {
    return (
        <button
            className={styles[styleType ? styleType : 'button']}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export default Button