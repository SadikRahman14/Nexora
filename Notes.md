# Developer Notes

## 📦 Installing Development-Only Dependencies

To install a package only for development (i.e., not required in production), use the `-D` or `--save-dev` flag:

```bash
npm i -D nodemon
```

## 📦 Keeping track of empty folder
Git does not keep a track of empty folders. We need to add a .gutkeep file in that folder to keep track
```bash
touch .controllers/.gitleep
```

## 📦 Connecting Database

**Always use try catch** 
 
 **The database is at another continent, So always use async await**

 ```js
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB Connected !! DB host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
}
 ```

 **Always put a semi before starting IIFE(Immediately Invoked Function Expression)**


### process.exit()
***Process is basically running instance of a program, Represenets the corrent operation in node.js***

>***process.exit(0)*** **means no error**

>***process.exit(1)*** **means general error(database failure etc.)**


### ConnectionInstance.connection()
>**When you call mongoose.connect(), it returns a promise that resolves to the Mongoose instance itself (which is also a connection object).**

#### **.connection() provides properties like :**
>.host — The hostname of the MongoDB server you're connected to.

>.port — The port number.

>.name — The database name.

>.readyState — The state of the connection (connected, disconnected, connecting, etc).

>.on() — To listen to connection events like errors, disconnected, connected, etc.






## Access Token and Refresh Token

✅ Access Token
A short-lived token (e.g., expires in 15 minutes).

Sent with each request to access protected resources (APIs).

Usually stored in memory or a secure cookie.

Contains user data (claims) like user ID, email, role, etc.

If expired, user must use a refresh token to get a new one.

✅ Refresh Token
A long-lived token (e.g., expires in 7 days or more).

Not sent on every request — only used to get a new access token.

Usually stored in an HTTP-only cookie or secure storage.

Only contains the user ID, for security.

```js
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}
```

## Callback of Multer
```js
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp") // cb(error, result) null means no error
    },

    /*
        You're telling Multer to store uploaded files on disk, not in memory.
        cb(null, "./public/temp") tells Multer to save the file in the ./public/temp directory.
        
    */
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})
```

**🧩 What Happens When You Call cb(...)?
Internally:**

>Multer collects all upload info (file type, field name, etc.)

>Calls your custom destination() and filename() functions

>When you call cb(...), it saves the file using:

>The path you gave in destination

>The name you gave in filename

>If you call cb(err) instead, the upload is aborted with an error.