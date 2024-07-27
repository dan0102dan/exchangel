import React, { ReactNode, MouseEvent } from 'react'
import styles from './Button.module.css'
import { useTranslation } from '../index'

interface ButtonProps {
    children: ReactNode
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
    loading?: boolean
    styleType?: 'trigger' | 'favorite' | 'unsubscribe'
    disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, onClick, loading, styleType = 'button', disabled = false }) => {
    const { t } = useTranslation()

    return (
        <button
            className={`${styles.button} ${styleType !== 'button' ? styles[styleType] : ''}`}
            onClick={onClick}
            disabled={loading || disabled}
        >
            {loading ? t('wait') : children}
        </button>
    )
}

export default Button
