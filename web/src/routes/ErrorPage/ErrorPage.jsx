import React from 'react'
import { useRouteError, useNavigate } from 'react-router-dom'
import { useTranslation, Button, Placeholder } from '../../Components/index'

const ErrorPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const error = useRouteError()
    console.error(error)

    return (
        <Placeholder
            title={t('oops')}
            description={t('unexpectedErrorOccurred')}
            errorInfo={error.statusText || error.message}
            icon={'👻'}
            action={<Button onClick={() => navigate('/')}>{t('restart')}</Button>}
        />
    )
}

export default ErrorPage