import React from 'react'
import { Section, Search, Cell } from '../../Components/index'
import img from '../../test/bitcoin.png'
import { server } from '../../API'

const Root = () => {
    const param = 'cur'

    const handleInputChange = async (e) => {
        console.log(e.target.value)
        try {
            console.log(await server.get('/search'))
        }
        catch (e) {
            console.error(e)
        }
    }

    const cur = [1, 2, 3, 1, 2, 32, 1, 3, 12, 3, 1, 2, 31, 2, 3, 1, 2, 3, 1, 2, 3, 12,]

    return (
        <>
            <Search onChange={handleInputChange} param={param} />
            <Section title='Favorite'>
                {cur.map((e, i) => (< Cell icon={img} title='BTCUSDT' subtitle='123' info1='+1232%' info2={'12321321rub'} />))}
            </ Section>
            <Section title='Top'>
                {cur.map(e => (< Cell icon={img} title='uuuppi' subtitle='123' info2={-232132} />))}
            </ Section>
        </>
    )
}

export default Root