import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
import { loginUser } from "../controllers/user.controller.js"
import { logoutUser } from "../controllers/user.controller.js"
import {refreshAccessToken} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verfiyJWT } from "../middlewares/auth.middleware.js"

const router= Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },{
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)

//secured routesr
router.route("/logout").post(verfiyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)


export default router