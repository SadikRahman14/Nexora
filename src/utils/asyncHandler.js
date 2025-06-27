
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}


/*
     For repetitive cases we write a higher-order function to wrap handlers and 
     catch errors automatically.

    app.get('/api', async (req, res, next) => {
        try {
        // async work
        } catch (err) {
            next(err); // Pass to Express error handler
        }
    });

    To not write try catch block everytime...

    How to use asyncHandler

    const getUser = async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (!user) throw new Error("User not found");
        res.json(user);
    };

    You wrap it like this in your route:

    import { asyncHandler } from "../utils/asyncHandler.js";
    router.get("/user/:id", asyncHandler(getUser));
*/











// const asyncHandler = (func) => async(req, res, next) => {
//     try {
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }