import { useRouteError, useNavigate } from "react-router-dom"
import { Button, Placeholder } from '../../Components/index'
import { ReactComponent as GhostIcon } from './GhostIcon.svg'

const ErrorPage = () => {
    const error = useRouteError()
    console.error(error)

    const navigate = useNavigate()

    return (
        <Placeholder
            title={'Oops!'}
            description={'Sorry, an unexpected error has occurred.'}
            errorInfo={error.statusText || error.message}
            icon={<GhostIcon />}
            action={
                <Button
                    onClick={() => navigate('/')}
                >
                    Restart
                </Button>
            }
        />
    )
}

export default ErrorPage