const sessionChecker = (req,res,next) => {

    if(req.session.user) {
        const roles = Object.values(req.session.user.roles).filter(Boolean)
        res.status(200).json({ roles })
    } else {
        next()
    }
}

module.exports = sessionChecker