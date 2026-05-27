const AUTH_COOKIE_NAME = "authToken";
const JWT_MAX_AGE_MS = 60 * 60 * 1000;

const getAuthCookieOptions = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: JWT_MAX_AGE_MS,
});

const setAuthCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
};

module.exports = {
    AUTH_COOKIE_NAME,
    getAuthCookieOptions,
    setAuthCookie,
    clearAuthCookie,
};
