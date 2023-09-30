import React from 'react'
import { useRouteError, useNavigate } from 'react-router-dom'
import { Button, Placeholder } from '../../Components/index'

const ErrorPage = () => {
    const navigate = useNavigate()

    const error = useRouteError()
    console.error(error)

    return (
        <Placeholder
            title={'Oops!'}
            description={'Sorry, an unexpected error has occurred.'}
            errorInfo={error.statusText || error.message}
            icon={'👻'}
            action={
                <Button onClick={() => navigate('/')}>
                    Restart
                </Button>
            }
        />
    )
}

export default ErrorPage