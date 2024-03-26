import React, { useState } from 'react'
import styles from './TriggerForm.module.css'
import { Button } from '../index'
import { server } from '../../API'
import { useTranslation } from '../../Components/index'

const TriggerForm = ({ instId, setSubscriptions }) => {
    const { t } = useTranslation()

    const [price, setPrice] = useState('')
    const [trend, setTrend] = useState('any')
    const [subscribing, setSubscribing] = useState(false)

    const options = {
        any: t('any'),
        up: t('up'),
        down: t('down')
    }

    const subscribe = async (e) => {
        e.preventDefault()

        const HapticFeedback = window.Telegram.WebApp.HapticFeedback
        if (!price || !trend) {
            HapticFeedback.notificationOccurred('error')
            return
        }

        setSubscribing(true)
        try {
            const { data } = await server.get('/subscribe', { params: { instId, price, trend } })
            setSubscriptions([...data])

            HapticFeedback.notificationOccurred('success')
        }
        catch (e) {
            console.error(e)
            HapticFeedback.notificationOccurred('error')
        }
        setSubscribing(false)
    }

    const selectionChange = (e) => {
        const HapticFeedback = window.Telegram.WebApp.HapticFeedback

        setTrend(e.target.value)
        HapticFeedback.selectionChanged()
    }

    return (
        <form className={styles.form} onSubmit={subscribe}>
            <div className={styles.field}>
                <div className={styles.labelContainer}>
                    <label className={styles.label}>{t('triggerPrice')}</label>
                </div>
                <input
                    type="text"
                    className={styles.input}
                    inputMode="decimal"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(',', '.'))}
                    placeholder={t('enterPrice')}
                    required
                />
                <div className={styles.labelContainer}>
                    <label className={styles.label}>{t('selectTrend')}</label>
                </div>
                <select
                    value={trend}
                    onChange={selectionChange}
                    className={styles.select}
                    required
                >
                    {Object.entries(options).map(([value, label]) =>
                        <option key={value} value={value}>{label}</option>
                    )}
                </select>
            </div>
            <Button
                styleType='triggerButton'
                loading={subscribing}
            >
                {t('subscribe')}
            </Button>
        </form>
    )
}

export default TriggerForm