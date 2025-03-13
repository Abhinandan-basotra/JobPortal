import jwt from 'jsonwebtoken';

const isAuthenticated = async (req,res,next) => {
    try{
        const token = req.cookies.token;
        
        if(!token){
            return res.status(401).json({
                msg: "User not authenticated",
                success: false
            });
        }

        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decoded){
            return res.status(401).json({
                msg: "Token is not valid",
                success: false
            });
        };
        req.id = decoded.userId;
        next();
    }catch(err){
        console.log(err);
        
    }
}

export default isAuthenticated;