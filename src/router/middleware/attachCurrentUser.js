const { getOpenIdProvider } = require('../../utils')
const userService = require('../../user/service')

const attachCurrentUser = async (req, res, next) => {
    try {
        const { sub } = req.tokenPayload
        const providerTag = getOpenIdProvider(req)
        const userRecord = await userService.findByProviderGivenId(providerTag, sub)
        console.log('userRecord is %o\n', userRecord)

        if (!userRecord) {
            return res.sendStatus(401)
        }

        req.currentUser = userRecord
        return next()
    } catch (error) {
        console.log('Error attaching user: %o', error)
        throw error
    }
}

module.exports = attachCurrentUser