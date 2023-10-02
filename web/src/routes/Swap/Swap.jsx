import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { server } from '../../API'
import styles from './Swap.module.css'

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

    return (
        <div className="swap-container">
            <div className="input-container">
                <input
                    type="number"
                    placeholder="Amount 1"
                />
            </div>
            <div className="input-container">
                <input
                    type="number"
                    placeholder="Amount 2"
                />
            </div>
        </div>
    )
}

export default Swap
