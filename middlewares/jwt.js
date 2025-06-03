import passport from "passport";

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Not authorized" });
  }

  passport.authenticate("jwt", { session: false }, (err, user) => {
    try {
      if (err || !user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const token = authHeader.replace("Bearer ", "");
      if (user.token !== token) {
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  })(req, res, next);
};
