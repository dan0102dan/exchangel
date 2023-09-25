import React from 'react'
import { useSearchParams } from "react-router-dom"
import styles from './Search.module.css'
import { ReactComponent as SearchIcon } from './SearchIcon.svg'
import { ReactComponent as CancelIcon } from './CancelIcon.svg'

const Search = ({ onChange, param }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const info = searchParams.get(param) || ''

    const handleInputChange = (e) => {
        if (e.target.value) {
            searchParams.set(param, e.target.value)
            setSearchParams(searchParams)
        }
        else
            handleClearSearch()

        onChange && onChange(e)
    }
    const handleClearSearch = () => {
        searchParams.delete(param)
        setSearchParams(searchParams)
    }

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchIcon}>
                <SearchIcon />
            </div>
            <input
                type="text"
                name="q"
                placeholder="Search"
                value={info}
                onChange={handleInputChange}
                className={styles.searchInput}
            />
            {info && (
                <div className={styles.clearIcon} onClick={handleClearSearch}>
                    <CancelIcon />
                </div>
            )}
        </div>
    )
}

export default Search