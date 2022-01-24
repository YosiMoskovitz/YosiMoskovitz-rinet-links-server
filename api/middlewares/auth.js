
import jwt from "jsonwebtoken";

export default {
    checkAuth: (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                const error = {
                    code: 401,
                    message: "Token was not provided" 
                }
                throw error
            }
            const user = jwt.verify(token, process.env.JWT_KEY);
            if (!user.id) {
                const error = {
                    code: 401,
                    message: "Token not valid or expired" 
                }
                throw error
            }
            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({
               message: error.message,
            })
        }
    },
    createToken: (user) => {
        const accessToken = jwt.sign({
            id: user._id, email: user.email, role: user.role
        },
            process.env.JWT_KEY,
            { expiresIn: '1d' });
        return accessToken;
    },
    isAdmin: (req, res, next) => {
        try {
            if (req.user.role.title !== 'admin') {
                const error = {
                    code: 401,
                    message: 'Unauthorized user'
                }
                throw error;
            }
            next();
        } catch (error) {
            res.status(error.code).json({
                message: error.message,
             })
        }
    },
}