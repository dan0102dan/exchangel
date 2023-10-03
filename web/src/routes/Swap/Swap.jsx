import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { server } from '../../API'
import { Section, InputNumber, MiniCell } from '../../Components/index'

const Swap = () => {
    let { instId } = useParams()

    const [ccy, setCcy] = useState({})

    const getCcy = async () => {
        try {
            const { data } = await server.get('/getCcy', { params: { instId } })
            setCcy(data)
            console.log(data)
        }
        catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (!Object.keys(ccy).length)
            getCcy()
    })


    const [amount1, setAmount1] = useState('')
    const [amount2, setAmount2] = useState('')

    const handleSwap = () => {
        // Обмен значениями amount1 и amount2
        const temp = amount1
        setAmount1(amount2)
        setAmount2(temp)
    }

    return (
        Object.keys(ccy).length
            ?
            <>
                <div>
                    <Section>
                        <MiniCell title={ccy.baseCcy.name} icon={ccy.baseCcy.logoLink} />
                        <InputNumber value={amount1} onChange={(e) => setAmount1(e.target.value)} />
                    </Section>
                    <button onClick={handleSwap}>
                        ⟳
                    </button>
                    <Section>
                        <MiniCell title={ccy.quoteCcy.name} icon={ccy.quoteCcy.logoLink} />
                        <InputNumber value={amount2} onChange={(e) => setAmount2(e.target.value)} />
                    </Section>
                </div>
            </>
            : <></>
    )
}

export default Swap