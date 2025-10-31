import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import friendshipRouter from "./routes/friendship.route.js";
import userRouter from "./routes/user.route.js";
import recentRouter from "./routes/recents.route.js";
import groupRouter from "./routes/group.route.js";
import savingGroupRouter from "./routes/saving.route.js";
import uploadRouter from "./routes/upload.route.js";
import transactionRouter from "./routes//transaction.route.js";
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// routes
app.use(authRouter);
app.use(friendshipRouter);
app.use(groupRouter);
app.use(savingGroupRouter);
app.use(userRouter);
app.use(recentRouter);
app.use(uploadRouter);
app.use(transactionRouter);

app.use(errorHandlerMiddleware);

export default app;
