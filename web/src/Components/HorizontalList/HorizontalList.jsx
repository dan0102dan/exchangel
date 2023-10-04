import React from 'react'
import styles from './HorizontalList.module.css'
import { Section } from '../index'

const HorizontalList = ({ children }) => {
    return (
        <Section>
            <div className={styles.horizontal}>
                {children}
            </div>
        </Section>
    )
}

export default HorizontalList