import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { server } from '../../API'
import { Section, InputNumber, MiniCell, Placeholder, Button, HorizontalList, InfoBlock } from '../../Components/index'

const Swap = () => {
    const { state } = useLocation()
    const { instId } = useParams()

    const [loading, setLoading] = useState(false)
    const [ccy, setCcy] = useState({ ...state })
    console.log(ccy)

    const getCcy = async () => {
        setLoading(true)
        try {
            const { data } = await server.get('/getCcy', { params: { instId } })
            setCcy(data)
        }
        catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (!Object.keys(ccy).length)
            getCcy()
    })

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
                    <HorizontalList>
                        <InfoBlock text="last" number={ccy.last} />
                        <InfoBlock text="24'highest" number={ccy.high24h} />
                        <InfoBlock text="24'lowest" number={ccy.low24h} />
                        <InfoBlock text="24'volume" number={ccy.vol24h} />
                    </HorizontalList>
                </>
    )
}

export default Swap