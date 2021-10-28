const express = require('express')
const route = express.Router()

const { policy: policyConfiguration } = require('../../config')

function policy(app) {
    app.use('/policy', route)

    route.get(
        '/',
        async (req, res, next) => {
            try {
                return res.status(200).json({ policy: policyConfiguration })
            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )
}

module.exports = policy