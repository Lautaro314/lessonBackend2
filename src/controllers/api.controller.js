const getSession = (req, res) => {
    if (!req.session?.passport?.user) {
        return res.status(401).json({
            status: 401,
            error: "Unauthorized",
            message: "No hay sesión activa",
        });
    }

    res.json({
        sessionId: req.sessionID,
        authenticated: req.isAuthenticated(),
        user: req.user
            ? {
                  userId: req.user._id,
                  email: req.user.email,
                  role: req.user.role,
              }
            : null,
    });
};

const getProfile = (req, res) => {
    res.json({
        message: "Perfil del usuario autenticado",
        user: {
            userId: req.usuario.userId,
            role: req.usuario.role,
        },
    });
};

const getAdmin = (req, res) => {
    res.json({
        message: "Zona admin",
        user: {
            userId: req.usuario.userId,
            role: req.usuario.role,
        },
    });
};

module.exports = { getSession, getProfile, getAdmin };
