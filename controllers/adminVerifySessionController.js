const handleVerifySession = async (req, res) => {
  if (req.session.user && req.cookies.sessionIdCookie) {
    const roles = Object.values(req.session.user.roles).filter(Boolean)
    return res.status(200).json({ user: req.session.user.username, roles: roles })
  }
  return res.status(400).send("No session found!")
}

module.exports = { handleVerifySession }
