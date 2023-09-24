import React, { useState } from 'react'
import styles from './Search.module.css'
import { ReactComponent as SearchIcon } from './SearchIcon.svg'
import { ReactComponent as CancelIcon } from './CancelIcon.svg'

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleClearSearch = () => {
        setSearchQuery('')
    }

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchIcon}>
                <SearchIcon />
            </div>
            <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
            />
            {searchQuery && (
                <div className={styles.clearIcon} onClick={handleClearSearch}>
                    <CancelIcon />
                </div>
            )}
        </div>
    )
}

export default Search