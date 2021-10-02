const store = require('./store')

async function authWithProvider(providerTag, payload, options) {
    try {
        switch (providerTag) {
            case 'google':
                return authWithGoogle(payload, options)
        
            default:
                throw new Error('No valid provider found')
        }
    } catch (error) {
        console.log('Error authenticating with %s provider: %o', providerTag, error)
        throw error
    }
}

async function authWithGoogle(payload, options) {
    let userRecord = await findByProviderGivenId('google', payload.sub, options)

    if (userRecord) {
        console.log('Existing user: %o', userRecord)
        return userRecord
    }

    userRecord = await createAccount(payload)
    console.log('New user: %o', userRecord)
    return userRecord
}

async function createAccount(tokenPayload) {
    let { email, email_verified, given_name, family_name, sub, iss, exp, picture, locale } = tokenPayload

    // Define provider tag
    let openid_provider_tag = ''
    switch (iss) {
        case "https://accounts.google.com":
            openid_provider_tag = 'google'
            break;
    
        default:
            break;
    }

    const userDTO = {
        firstName: given_name,
        lastName: family_name,
        email,
        email_verified,
        openid_provider_tag,
        openid_provider_sub: sub,
        openid_provider_picture: picture,
        openid_provider_exp: exp,
        openid_provider_lang: locale || 'en'
    }

    return store.create(userDTO)
}

async function findByProviderGivenId(providerTag, id, options) {
    const include = determingEagerLoading(options)
    
    return store.findWhere({
        openid_provider_tag: providerTag,
        openid_provider_sub: id
    }, include)
}

function determingEagerLoading(options) {
    if (options) {
        const include = []
        const { hasClocks, hasContacts, hasEvents } = options
        
        if (hasClocks) include.push(require('../clock/model'))
        if (hasContacts) include.push(require('../contact/model'))
        if (hasEvents) include.push(require('../event/model'))

        if (include.length > 0) {
            return include
        }
    }

    return null
}

module.exports = {
    authWithProvider,
    findByProviderGivenId
}