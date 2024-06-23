const AdminUser = require('../model/AdminUser')
const bcrypt = require('bcrypt')

const handleLogin = async (req,res) => {

    const { user, pwd } = req.body
    if(!user || !pwd) return res.status(400).json({ 'message': 'Username and Password are required.' })
    
    const foundUser = await AdminUser.findOne({username: user}).exec()
    if(!foundUser) return res.sendStatus(401)
    
    const match = await bcrypt.compare(pwd, foundUser.password)
    if(match) {
        const roles = Object.values(foundUser.roles).filter(Boolean)
        req.session.user = foundUser
        req.session.save(err => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error')
            } else {
                res.status(200).json({ roles })
            }
        })
    } else {
        res.sendStatus(401)
    }
}

module.exports = { handleLogin }
