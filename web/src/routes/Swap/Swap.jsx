import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { server } from '../../API'
import { useAppState, useTranslation, Section, InputNumber, MiniCell, Placeholder, Button, StrokeCell, ProgressBar, TriggerForm, TriggerList } from '../../Components/index'
import { smartRound } from '../../functions'

const Swap = () => {
    const { state } = useLocation()
    const { t } = useTranslation()
    const { instId } = useParams()

    const { favorites, setFavorites } = useAppState()

    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)

    const [subscriptions, setSubscriptions] = useState()
    const [gettingSubscriptions, setGettingSubscriptions] = useState(true)

    const [ccy, setCcy] = useState({ ...state })
    const [baseCcy, setBaseCcy] = useState('')
    const [quoteCcy, setQuoteCcy] = useState('')

    const getCcy = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await server.get('/getCcy', { params: { instId } })
            if (data.isFavorite)
                setFavorites([data])
            setCcy(data)
            if (baseCcy)
                setQuoteCcy(baseCcy * data.last)
            else if (quoteCcy)
                setBaseCcy(quoteCcy / data.last)
        }
        catch (e) {
            console.error(e)
        }
        setLoading(false)
    }, [instId, setFavorites, baseCcy, quoteCcy])

    useEffect(() => {
        if (!Object.keys(ccy).length)
            getCcy()
        else
            setLoading(false)
    }, [ccy, getCcy])

    const baseSwap = ({ target: { value } }) => {
        setBaseCcy(value)
        setQuoteCcy(smartRound(value * ccy.last) || '')
    }
    const quoteSwap = ({ target: { value } }) => {
        setQuoteCcy(value)
        setBaseCcy(smartRound(value / ccy.last) || '')
    }

    useEffect(() => {
        setIsFavorite(favorites?.some(e => e.instId === ccy.instId))
    }, [favorites, ccy])

    const toggleFavorite = async () => {
        const HapticFeedback = window.Telegram.WebApp.HapticFeedback
        setToggling(true)

        try {
            HapticFeedback.selectionChanged()
            const { data } = await server.get('/toggleFavorite', { params: { instId } })
            if (data)
                setFavorites([ccy, ...favorites])
            else
                setFavorites(favorites.filter(e => e.instId !== ccy.instId))
        }
        catch (e) {
            console.error(e)
            HapticFeedback.notificationOccurred('error')
        }
        setToggling(false)
    }

    return (
        !loading && !Object.keys(ccy).length
            ?
            <Placeholder
                title={t('empty')}
                description={t('nothingFound')}
                icon={'😔'}
                action={<Button onClick={() => getCcy()}>{t('reload')}</Button >}
            />
            :
            <>
                <Section loading={loading}>
                    <MiniCell title={ccy.baseCcy?.name} icon={ccy.baseCcy?.logoLink} loading={loading} />
                    <InputNumber value={baseCcy} onChange={baseSwap} />
                    <MiniCell title={ccy.quoteCcy?.name} icon={ccy.quoteCcy?.logoLink} loading={loading} />
                    <InputNumber value={quoteCcy} onChange={quoteSwap} />
                </Section>
                <Section title={t('info')} loading={loading}>
                    <StrokeCell
                        text={`1 ${ccy.baseCcy?.ccy} = ${ccy.last} ${ccy.quoteCcy?.ccy}`}
                        loading={loading} />
                    <StrokeCell
                        text={`${t('volume24h')}: ${smartRound(Number(ccy.vol24h))} ${ccy.baseCcy?.ccy}`}
                        loading={loading}
                    />
                    <ProgressBar
                        minValue={ccy.low24h}
                        maxValue={ccy.high24h}
                        openPrice={ccy.open24h}
                        currentPrice={ccy.last}
                        title={t('daysRange').toLowerCase()}
                    />
                    <Button
                        styleType='favorite'
                        onClick={toggleFavorite}
                        loading={loading || toggling}
                    >
                        {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                    </Button>
                </Section>
                <Section title={t('triggers')} loading={gettingSubscriptions}>
                    <TriggerForm
                        instId={instId}
                        setSubscriptions={setSubscriptions}
                    />
                    <TriggerList
                        instId={instId}
                        subscriptions={subscriptions}
                        setSubscriptions={setSubscriptions}
                        setGettingSubscriptions={setGettingSubscriptions}
                    />
                </Section>
            </>
    )
}

export default Swap