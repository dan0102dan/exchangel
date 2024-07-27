import React from 'react'
import styles from './Section.module.css'
import { useTranslation } from '../../Components/index'

const Section = ({ title, children, loading }) => {
    const { t } = useTranslation()

    return (
        <div className={loading ? styles.loading : styles.section}>
            {title && <span className={styles.title}>
                {loading ? t('loading') : title}
            </span>}
            {children}
        </div>
    )
}

export default Section