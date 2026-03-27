import {http, HttpResponse} from 'msw'

type LoginRequest = {
    email: string
    password: string
}

export const handlers = [
    http.post('/api/auth/login', async ({request})=> {
        const {email, password} = await request.json() as LoginRequest

        if (!email || !password) {
            return HttpResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            )
        }

        return HttpResponse.json({
            token: 'fake-jwt-token'
        })
    })
]
