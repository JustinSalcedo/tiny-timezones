const { google } = require('../../config')
const { getOpenIdProvider } = require('../../utils')

const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(google.clientId)

const signupWithGoogle = async (req, res, next) => {
    try {
        const { credential: idToken } = req.body
        const ticket = await client.verifyIdToken({
            idToken,
            audience: google.clientId
        })
        req.tokenPayload = ticket.getPayload()

        return next()
    } catch (error) {
        console.log('Error signing up with Google: %o', error)
        return next(error)
    }
}

async function signUp(req, res, next) {
    const providerTag = getOpenIdProvider(req)

    switch (providerTag) {
        case 'google':
            return signupWithGoogle(req, res, next)
    
        default:
            return next(new Error('No valid provider found'))
    }
}

module.exports = signUp