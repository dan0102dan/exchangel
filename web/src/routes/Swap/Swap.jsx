import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { server } from '../../API'
import { Section, InputNumber, MiniCell, Placeholder, Button, HorizontalList, InfoBlock, ProgressBar } from '../../Components/index'

const Swap = () => {
    const { state } = useLocation()
    const { instId } = useParams()

    const [loading, setLoading] = useState(false)
    const [ccy, setCcy] = useState({ ...state })

    const getCcy = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await server.get('/getCcy', { params: { instId } })
            setCcy(data)
        }
        catch (e) {
            console.error(e)
        }
        setLoading(false)
    }, [instId])

    useEffect(() => {
        if (!Object.keys(ccy).length)
            getCcy()
    }, [ccy, getCcy])

    const [baseCcy, setBaseCcy] = useState('')
    const [quoteCcy, setQuoteCcy] = useState('')

    const baseSwap = (e) => {
        setBaseCcy(e.target.value)
        setQuoteCcy(e.target.value * ccy.last || '')
    }
    const quoteSwap = (e) => {
        setQuoteCcy(e.target.value)
        setBaseCcy(e.target.value / ccy.last || '')
    }

    return (
        loading
            ?
            <Placeholder
                title={'Loading...'}
                description={'Getting basic information.'}
                icon={'🔍'}
            />
            : !Object.keys(ccy).length
                ?
                <Placeholder
                    title={'Empty'}
                    description={'Unfortunately, nothing was found.'}
                    icon={'😔'}
                    action={<Button onClick={() => getCcy()}>Reload</Button >}
                />
                :
                <>
                    <Section>
                        <MiniCell title={ccy.baseCcy.name} icon={ccy.baseCcy.logoLink} />
                        <InputNumber value={baseCcy} onChange={baseSwap} />
                    </Section>
                    <Section>
                        <MiniCell title={ccy.quoteCcy.name} icon={ccy.quoteCcy.logoLink} />
                        <InputNumber value={quoteCcy} onChange={quoteSwap} />
                    </Section>
                    <Section title='Info'>
                        <HorizontalList>
                            <InfoBlock text="last" number={ccy.last} />
                            <InfoBlock text="open" number={ccy.open24h} />
                            <InfoBlock text="24'highest" number={ccy.high24h} />
                            <InfoBlock text="24'lowest" number={ccy.low24h} />
                            <InfoBlock text="24'volume" number={ccy.vol24h} />
                        </HorizontalList>
                        <ProgressBar
                            minValue={ccy.low24h}
                            maxValue={ccy.high24h}
                            openPrice={ccy.open24h}
                            currentPrice={ccy.last}
                            title="day's range"
                        />
                    </Section>
                </>
    )
}

export default Swap