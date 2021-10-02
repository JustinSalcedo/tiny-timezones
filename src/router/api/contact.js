const express = require('express')
const route = express.Router()

const isAuth = require('../middleware/isAuth')
const attachCurrentUser = require('../middleware/attachCurrentUser')
const contactService = require('../../contact/service')

function contact(app) {
    app.use('/contact', route)

    route.post(
        '/',
        isAuth,
        attachCurrentUser,
        async (req, res, next) => {
            try {
                const { id } = req.currentUser
                const { name, timezone } = req.body
                console.log('Body is %o\n', req.body)
                const contactRecord = await contactService.createContact(id, { name, timezone })

                if (!contactRecord) {
                    return res.status(400).json({ error: 'Contact could not be created' })
                }

                return res.status(201).json(contactRecord)

            } catch (error) {
                console.log('Error in %s: %o', req.path, error)
                return next(error)
            }
        }
    )
}

module.exports = contact