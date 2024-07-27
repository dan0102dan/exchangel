import React, { useCallback, useEffect } from 'react'
import styles from './TriggerList.module.css'
import { Button, Placeholder } from '../index'
import { server } from '../../API'
import { useTranslation } from '../index'

const TriggerList = ({ instId, subscriptions, setSubscriptions, setGettingSubscriptions }) => {
    const { t } = useTranslation()

    const options = {
        any: t('any'),
        up: t('up'),
        down: t('down')
    }

    const getSubscriptions = useCallback(async () => {
        setGettingSubscriptions(true)
        try {
            const { data } = await server.get('/subscriptions', { params: { instId } })

            setSubscriptions(data)
        }
        catch (e) {
            console.error(e)
        }
        setGettingSubscriptions(false)
    }, [instId, setSubscriptions, setGettingSubscriptions])

    useEffect(() => {
        if (!subscriptions)
            getSubscriptions()
    }, [subscriptions, getSubscriptions])


    const unsubscribe = async (price, trend) => {
        const HapticFeedback = window.Telegram.WebApp.HapticFeedback
        //TODO
        // setSubscribing(true)
        try {
            const { data } = await server.get('/unsubscribe', { params: { instId, price, trend } })
            setSubscriptions([...data])

            HapticFeedback.notificationOccurred('success')
        }
        catch (e) {
            console.error(e)
            HapticFeedback.notificationOccurred('error')
        }
        // setSubscribing(false)
    }

    return (
        subscriptions?.length > 0
            ? subscriptions.map((e) =>
                <div key={e.price + e.trend} className={styles.item}>
                    <div className={styles.details}>
                        <span>{t('price')}: {e.price}</span>
                        <span>{t('trend')}: {options[e.trend]}</span>
                    </div>
                    <Button
                        onClick={() => unsubscribe(e.price, e.trend)}
                        styleType={'unsubscribeButton'}
                    >
                        {t('unsubscribe')}
                    </Button>
                </div>
            )
            : <Placeholder
                title={t('noSubscriptions')}
                description={t('subscriptionInstructions')}
                icon={'📭'}
            />
    )
}

export default TriggerList