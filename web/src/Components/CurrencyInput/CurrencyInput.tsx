import React from 'react'
import styles from './CurrencyInput.module.css'
import { Button } from '../'

interface Props {
    amount: string
    setAmount: (value: string) => void
    loading: boolean
    title: string
    icon?: string
}

const CurrencyInput: React.FC<Props> = ({ amount, setAmount, loading, title, icon }) => {
    const handleInput = (value: string) => {
        if (value !== '.' || !amount.includes('.')) {
            setAmount(amount + value)
        }
    }

    return (
        <div className={styles.modal}>
            <div className={styles.header}>
                {loading ? <div className={styles.placeholderIcon} /> : icon && <img className={styles.icon} src={icon} alt="Icon" loading="lazy" />}
                <div className={styles.titleContainer}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.amount}>{amount}</span>
                </div>
            </div>
            <div className={styles.numPad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(key => (
                    <Button
                        key={key}
                        onClick={() => key === '⌫' ? setAmount(amount.slice(0, -1)) : handleInput(key)}
                        disabled={loading}
                        styleType={'trigger'}
                    >
                        {key}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export default CurrencyInput
