const AdminUser = require('../model/AdminUser')
const bcrypt = require('bcrypt')

const handleNewUser = async (req,res) => {
    const { user, pwd } = req.body
    if(!user || !pwd) return res.status(400).json({ 'message': 'Username and Password are required.' })

    const duplicate = await AdminUser.findOne({username: user}).exec()
    if(duplicate) return res.sendStatus(409) // conflict

    try {
        const hashedPwd = await bcrypt.hash(pwd, 10)

        const newUser = await AdminUser.create({
            'username': user,
            'password': hashedPwd
        })

        res.status(201).json({ 'success': `New user ${user} created!` })
    } catch(err) {
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { handleNewUser }
