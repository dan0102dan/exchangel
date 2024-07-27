import React, { useState, useEffect } from 'react'
import styles from './CurrencyInput.module.css'

interface Props {
    amount: string
    setAmount: (value: string) => void
    loading: boolean
    title: string
    icon?: string
}

const CurrencyInput: React.FC<Props> = ({ amount, setAmount, loading, title, icon }) => {
    const handleInput = (value: string) => {
        if (!loading && (value !== '.' || !amount.includes('.'))) {
            setAmount(amount + value)
        }
    }

    const deleteLast = () => {
        if (!loading) {
            setAmount(amount.slice(0, -1))
        }
    }

    const handleKeyPress = (key: string) => {
        if (!loading) {
            key === '⌫' ? deleteLast() : handleInput(key)
        }
    }

    return (
        <div className={styles.modal}>
            <div className={styles.header}>
                {loading ? <div className={styles.placeholderIcon} /> : icon && <img className={styles.icon} src={icon} alt="Icon" loading="lazy" />}
                <div className={styles.titleContainer}>
                    <span className={styles.title}>{loading ? 'Loading...' : title}</span>
                    <span className={styles.amount}>{loading ? '...' : amount}</span>
                </div>
            </div>
            <div className={styles.numPad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(key => (
                    <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className={styles.numButton}
                        disabled={loading}
                    >
                        {key}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default CurrencyInput
