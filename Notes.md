# <p align="center">Developer Notes</p>

***“This project was built as a learning journey to dive deep into backend development using Node.js, Express and MongoDB (Mongoose). Each feature was carefully implemented to mirror real-world backend architecture and best practices.”***

<br><br><br>
## <p align="center">📦 Project Structure</p>
src/ <br>
├── controllers/ <br>
├── models/ <br>
├── routes/ <br>
├── middleware/ <br>
├── utils/ <br>
├── index.js
<br><br><br>
   
## <p align="center">📦 Installing Development-Only Dependencies</p>


To install a package only for development (i.e., not required in production), use the `-D` or `--save-dev` flag:

```bash
npm i -D nodemon
```

## 📦 Keeping track of empty folder
Git does not keep a track of empty folders. We need to add a .gutkeep file in that folder to keep track
```bash
touch .controllers/.gitleep
```
<br><br><br>
## <p align="center">📦 Connecting Database</p>


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





<br><br><br>
## <p align="center">Access Token and Refresh Token</p>


 ### Access Token
> A short-lived token (e.g., expires in 15 minutes).
 
> Sent with each request to access protected resources (APIs).  

> Usually stored in memory or a secure cookie.  

> Contains user data (claims) like user ID, email, role, etc.  

> If expired, user must use a refresh token to get a new one.  

### Refresh Token
> A long-lived token (e.g., expires in 7 days or more).

> Not sent on every request — only used to get a new access token.

> Usually stored in an HTTP-only cookie or secure storage.

> Only contains the user ID, for security.

<br><br>
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
<br><br><br>
## <p align="center">Callback of Multer</p>

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

<br><br><br>
## <p align="center">HTTP Headers</p>
**1. Request Header - from client  
2. Response header - from server  
3. Representation header - encoding/compression  
4. Playload header - data**
<br><br><br>
## <p align="center">HTTP Requests</p>  

| Method | Action | 
|----------|----------|
|  GET   |  Fetch Data (retrive and resource)  | 
|  POST    |  Create a new resource on the server  | 
| PUT    | Replace an existing resource completely  | 
| PATCH    |   Partially update a resource | 
| DELETE    | Delete a resource.  |
| HEAD   | Same as GET, but only returns headers — no body  |
| OPTIONS    |  Returns the allowed HTTP methods for a resource (CORS preflight)  |
|  TRACE  | Debugging — echoes back the received request |

<br><br>
## <p align="center">🌐 HTTP Status Codes Cheat Sheet</p>  

## 1xx – Informational

>100	    Continue:	Client can continue with request

>101	Switching Protocols	Server: agrees to switch protocols (e.g., HTTP to WebSocket)

 ## 2xx – Success

>200	OK:	Successful request

>201	Created:	Resource created successfully

>202	Accepted:	Request accepted, processing later

>204	No Content:	Success, but no content returned

## 3xx – Redirection

>301	Moved Permanently:	Resource has moved to a new URL

>302	Found:	Temporary redirect to another URL

>304	Not Modified:	Cached version is still valid

## 4xx – Client Errors

>400	Bad Request:	Malformed syntax / Invalid input

>401	Unauthorized:	Auth required (missing/invalid token)

>403	Forbidden:	Access denied even if authenticated

>404	Not Found:	Resource doesn’t exist

>405	Method Not Allowed:	HTTP method not supported by the route

>409	Conflict:	Duplicate or conflicting resource

>422	Unprocessable Entity:	Validation error (common in APIs)

## 5xx – Server Errors
>500	Internal Server Error:	Generic server error

>501	Not Implemented:	Method not supported by server

>502	Bad Gateway:	Invalid response from upstream server

>503	Service Unavailable:	Server is down or overloaded

>504	Gateway: Timeout	Upstream server didn’t respond in time

<br><br>
## <p align="center"> Subscribed - Subscriber</p>
![Note](https://i.imgur.com/pK8gZSB.png)

```js
import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User" // One who is subscribing
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User" // Owner of the channel      
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
```
In Subscription Schema There is two component: Channel and Subscribers

If a subscribes to CAC then it will make a new document in databsae as given in image
And while counting number of Suscriber of a channel, we will count in how many document has CAC as channel
And while counting how many channels a user subscribed we will count how many document has that user as sbscriber



