const { google } = require('../../config')
const { getTokenFromHeader, getOpenIdProvider } = require('../../utils')

const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(google.clientId)

const isAuth = async (req, res, next) => {
    try {
        const idToken = getTokenFromHeader(req)
        const providerTag = getOpenIdProvider(req)

        console.log('idToken is %o\n and providerTag is %o\n', idToken, providerTag)

        switch (providerTag) {
            case 'google':
                req.tokenPayload = await validateWithGoogle(idToken)
                break;
        
            default:
                throw new Error('No valid provider tag found')
        }

        return next()
    } catch (error) {
        console.log('Authentication error: %o', error)
        return next(error)
    }
}

async function validateWithGoogle(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: google.clientId
        })
        return ticket.getPayload()
    } catch (error) {
        console.log('Error validating with Google: %o', error)
        throw error
    }
}

module.exports = isAuth