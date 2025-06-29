class ApiResponse{
    constructor(
        statusCode,
        data, // 	Actual payload — what your API is returning
        message= "Success", // 	Optional success message; default is "Success"
    ){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 // Automatically true if statusCode < 400, false otherwise
    }
}

export { ApiResponse }
 
/*
    HTTP status code:   
    Informational responses (100 – 199)
    Successful responses (200 – 299)
    Redirection messages (300 – 399)
    Client error responses (400 – 499)
    Server error responses (500 – 599)
*/

/*
    return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"));
*/