const handleLogout = async (req, res) => {
  // On Client, also delete the sessionIdCookie

  if (req.session.user && req.cookies.sessionIdCookie) {
    // res.clearCookie("sessionIdCookie")
    res.clearCookie("sessionIdCookie", {
      httpOnly: true,
      secure: false,
      sameSite: "none",
    })
  }
  return res.status(200).send("Logged out!")
}

module.exports = { handleLogout }
