import React, { useState, useEffect } from 'react'
import { useSearchParams } from "react-router-dom"
import styles from './Search.module.css'
import { ReactComponent as SearchIcon } from './SearchIcon.svg'

const Search = ({ setInput, setDebounceInput, param }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [prevParam, setPrevParam] = useState('')
    const [typingTimeout, setTypingTimeout] = useState()

    useEffect(() => {
        const paramValue = searchParams.get(param) || ''

        if (prevParam !== paramValue) {
            setInput && setInput(paramValue)

            if (!typingTimeout)
                setDebounceInput && setDebounceInput(paramValue)
        }
    })

    const handleInputChange = (e) => {
        setPrevParam(searchParams.get(param))

        const { value } = e.target

        if (value)
            searchParams.set(param, value)
        else
            searchParams.delete(param)
        setSearchParams(searchParams)

        // debounce
        if (typingTimeout) {
            clearTimeout(typingTimeout)
        }
        setTypingTimeout(
            setTimeout(() => {
                setDebounceInput(value)
            }, 400)
        )
    }

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchIcon}>
                <SearchIcon />
            </div>
            <input
                type='text'
                name='q'
                placeholder='Search'
                value={searchParams.get(param) || ''}
                onChange={handleInputChange}
            />
        </div>
    )
}

export default Search