import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express() // creates a app instance which will hold routes, middlewares and configs

app.use(cors({
    origin: process.env.CORS_ORIGIN, // this allow only specific frontend to access your backend
    credentials: true // enables cookies, auth headers etc to sent in requests 
}))

app.use(express.json({ // enables backend to accpet application/json requests
    limit:"16kb" // prevents large JSON bodies
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public")) // This allows you to serve things like images, HTML, CSS, etc., from a folder named public/.
app.use(cookieParser());


// import routers
import userRouter from "./routes/user.routes.js"
import healthCheckRoutes from "./routes/healthcheck.route.js"
import tweetRouter from "./routes/tweet.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
import videoRouter from "./routes/video.route.js"
import commentRouter from "./routes/comments.route.js"
import likeController from "./routes/like.route.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1", healthCheckRoutes);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/video", videoRouter); 
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeController);


/*
    http://localhost:8000/api/v1/users/register
    We are using users/ path and giving it to userRouter which has a path to register
*/

export { app }