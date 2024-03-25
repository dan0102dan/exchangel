import React from 'react'
import styles from './Button.module.css'
import { useTranslation } from '../../Components/index'

const Button = ({ children, onClick, loading, styleType, disabled }) => {
    const { t } = useTranslation()

    return (
        <button
            className={styles[styleType ? styleType : 'button']}
            onClick={onClick}
            disabled={loading || disabled}
        >
            {loading ? t('wait') : children}
        </button>
    )
}

export default Button