const User = require('../model/User')
const { OAuth2Client } = require('google-auth-library')
const { googleConfig } = require("../config/google.config")
const client = new OAuth2Client(googleConfig.clientId, googleConfig.clientSecret)

async function verify(tokenId) {
  const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: googleConfig.clientId
  })
  const payload = ticket.getPayload()
  return payload
}

const handleLogin = async (req,res) => {

    const { tokenId } = req.body
    try {
        const payload = await verify(tokenId)
        const sub = payload['sub'].toString()
        const name = payload['name'].toString()
        const emailAddress = payload['email'].toString()
        const profilePhoto = payload['picture'].toString()

        let user = await User.findOne({ emailAddress: emailAddress });
        if (!user) {
            user = await User.create({
                'name': name,
                'emailAddress': emailAddress,
                'profilePhoto': profilePhoto,
                'moviesWatchLater': [],
                'tickets': []
            });
        }
        req.session.userApp = user;

        const userFromDB = await User.findOne({ emailAddress: emailAddress })

        res.status(201).json({ 'message': `New user ${name} created!`, 'user': userFromDB })

    } catch (error) {

        res.status(500).json({ 'message': error.message })
    }
    
}

module.exports = { handleLogin }
