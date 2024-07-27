import React from 'react'
import styles from './ProgressBar.module.css'

const ProgressBar = ({ minValue, maxValue, openPrice, currentPrice, title }) => {
    const totalRange = maxValue - minValue
    const filledRange = Math.abs(currentPrice - openPrice)
    const leftOffset = ((Math.min(openPrice, currentPrice) - minValue) / totalRange) * 100
    const filledWidth = (filledRange / totalRange) * 100

    const progressFillClass = `${styles.progressFill} ${currentPrice > openPrice ? styles.progressFillPositive :
        currentPrice < openPrice ? styles.progressFillNegative :
            ''}`

    return (
        <div className={styles.container}>
            <div className={styles.label}>
                <span className={styles.minValue}>{minValue}</span>
                <span className={styles.title}>{title}</span>
                <span className={styles.maxValue}>{maxValue}</span>
            </div>
            <div className={styles.progressBar} aria-label={`Current progress between ${minValue} and ${maxValue}`}>
                <div
                    className={progressFillClass}
                    style={{
                        width: `${filledWidth}%`,
                        left: `${leftOffset}%`
                    }}
                ></div>
            </div>
        </div>
    )
}

export default ProgressBar