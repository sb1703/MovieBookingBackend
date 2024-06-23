const verifyAdmin = (req, res, next) => {

    if(req.session.user && req.session.user.roles?.Admin) {
        next()
    } else {
        res.status(200).send(`You are not an admin! or not logged in!`)
    }
    
}

module.exports = verifyAdmin