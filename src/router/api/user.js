const express = require('express')
const route = express.Router()

const userService = require('../../user/service')

function user(app) {
    app.use('/user', route)

    // route.get(
    //     '/',
    //     async (req, res, next) => {
    //         try {
    //             const id = req.session.userId
    //             const userRecords = await userService.findByUserId(id)

    //             if (!userRecords) {
    //                 return res.status(400).json({ error: 'Users could not be fetched' })
    //             }

    //             return res.status(200).json({ users: userRecords })
    //         } catch (error) {
    //             console.log('Error in %s: %o', req.originalUrl, error)
    //             return next(error)
    //         }
    //     }
    // )

    // route.post(
    //     '/',
    //     async (req, res, next) => {
    //         try {
    //             const id = req.session.userId
    //             const { name, timezone, users } = req.body

    //             if (users) {
    //                 const userRecords = await userService.createManyUsers(id, users)

    //                 if (!userRecords) {
    //                     return res.status(400).json({ error: 'Users could not be created' })
    //                 }
    
    //                 return res.status(201).json({ users: userRecords })
    //             }
                
    //             const userRecord = await userService.createUser(id, { name, timezone })

    //             if (!userRecord) {
    //                 return res.status(400).json({ error: 'User could not be created' })
    //             }

    //             return res.status(201).json(userRecord)

    //         } catch (error) {
    //             console.log('Error in %s: %o', req.originalUrl, error)
    //             return next(error)
    //         }
    //     }
    // )

    route.patch(
        '/',
        async (req, res, next) => {
            try {
                const { userId } = req.session
                
                if (Object.keys(req.body).length === 0) {
                    return res.status(400).json({ error: 'User needs at least one field to be updated' })
                }

                const wasUpdated = await userService.updatePreferencesById(userId, req.body)

                if (!wasUpdated) {
                    return res.status(400).json({ error: 'User could not be updated' })
                }

                return res.status(200).end()

            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )

    // route.delete(
    //     '/:userId',
    //     async (req, res, next) => {
    //         try {
    //             const { userId } = req.session
    //             const { userId } = req.params

    //             await userService.deleteOneUser(userId, userId)

    //             return res.status(200).end()

    //         } catch (error) {
    //             console.log('Error in %s: %o', req.originalUrl, error)
    //             return next(error)
    //         }
    //     }
    // )
}

module.exports = user