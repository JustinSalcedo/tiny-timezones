const express = require('express')
const route = express.Router()

const config = require('../../config')
const utils = require('../../utils')
const signUp = require('../middleware/signUp')
const userService = require('../../user/service')

function auth(app) {
    app.use('/auth', route)

    route.post(
        '/:providerTag',
        signUp,
        async (req, res, next) => {
            try {
                const providerTag = utils.getOpenIdProvider(req)
                const user = await userService.authWithProvider(providerTag, req.tokenPayload, {
                    hasClocks: true,
                    hasContacts: true,
                    hasEvents: true
                })
                const { token } = req           
    
                const encodedPayload = utils.encodePayloadToURISafe({
                    user,
                    token
                })
                
                const redirectUri = `http://${config.host}:${config.port}/callback?payload=${encodedPayload}`
                return res.redirect(302, redirectUri)
            } catch (error) {
                console.log('Error in %s: %o', req.path, error)
                return next(error)
            }
        }
    )
}

module.exports = auth