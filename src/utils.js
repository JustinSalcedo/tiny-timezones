const { providerTags } = require('./config')

const encodePayloadToURISafe = (payload) => {
    const stringified = JSON.stringify(payload)
    const base64 = Buffer.from(stringified).toString('base64')
    const uriEncoded = encodeURIComponent(base64)

    return uriEncoded
}

const getTokenFromHeader = (req) => {
    if (
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
        return req.headers.authorization.split(' ')[1]
    }
    return null
}

const getOpenIdProvider = (req) => {
    if (req.headers['openid-provider'] && providerTags.includes(req.headers['openid-provider'])) {
        return req.headers['openid-provider']
    }

    if (req.params.providerTag && providerTags.includes(req.params.providerTag)) {
        return req.params.providerTag
    }
    return null
}

module.exports = {
    encodePayloadToURISafe,
    getTokenFromHeader,
    getOpenIdProvider
}