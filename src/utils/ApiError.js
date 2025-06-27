class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message) // This calls the parent (Error) constructor so that message gets registered as the error's message.
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack) this.stack = stack
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }