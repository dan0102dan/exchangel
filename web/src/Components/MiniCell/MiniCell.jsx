import React from 'react'
import styles from './MiniCell.module.css'

const MiniCell = ({ title, icon, loading }) => {
    return (
        <div className={styles.cell}>
            {loading
                ? <div className={styles.placeholderIcon} />
                : icon && <img className={styles.icon} src={icon} alt="Icon" loading="lazy" />}
            <div className={styles.content}>
                <div className={styles.title}>{loading ? '...' : title}</div>
            </div>
        </div >
    )
}

export default MiniCell