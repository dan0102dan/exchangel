import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './Swap.css'

const Swap = () => {
    let { instId } = useParams()

    const [amount1, setAmount1] = useState('')
    const [amount2, setAmount2] = useState('')

    const handleAmountChange = (event) => {
        const inputAmount = event.target.value
        // Здесь вы можете добавить логику для конвертации валюты, используя введенное значение input
        // Например, можно использовать API для получения актуальных курсов обмена

        // В этом примере просто отобразим введенное значение в обоих input
        setAmount1(inputAmount)
        setAmount2(inputAmount)
    }

    useEffect(() => {
        console.log(instId)
    })

    return (
        <div className="swap-container">
            <div className="input-container">
                <input
                    type="number"
                    placeholder="Amount 1"
                    value={amount1}
                    onChange={handleAmountChange}
                />
            </div>
            <div className="input-container">
                <input
                    type="number"
                    placeholder="Amount 2"
                    value={amount2}
                    onChange={handleAmountChange}
                />
            </div>
        </div>
    )
}

export default Swap
