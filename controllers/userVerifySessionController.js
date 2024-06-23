const handleVerifySession = async (req, res) => {
    if (req.session.userApp && req.cookies.sessionIdCookie) {
      const userApp = Object.values(req.session.userApp)
      return res.status(200).json({ user: userApp })
    }
    return res.status(400).json({ message: "No session found!" })
  }
  
module.exports = { handleVerifySession }  