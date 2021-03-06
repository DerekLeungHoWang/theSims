const initState = {
    isLoggedIn: sessionStorage.getItem('USER_TOKEN') === null ? false : true,
    userProfile: [],
    orderHistory: [],
    invoicePdfUrl: ""
}

const AuthenticationReducer = (state = initState, action) => {

    switch (action.type) {

        case ("LOGIN_ACTION"):


            return {
                ...state,
                isLoggedIn: action.isLoggedIn
            };
            break;
        case ("LOGOUT_ACTION"):
                
            return {
                ...state,
                isLoggedIn: false

            };
            break;
        //========================================================================================================================
        case ("SIGNUP_SUCCESS"):

            return state;

        case ("SIGNUP_FAILURE"):
            return state;

        case ("GET_USER_PROFILE_SUCCESS"):

            return {
                ...state,
                userProfile: action.payload.detail
            };


        case ("GET_USER_ORDER_HISTORY_SUCCESS"):



            return {
                ...state,
                orderHistory: action.payload.detail
            };
        case ("GET_USER_ORDER_HISTORY_INVOICE_SUCCESS"):



            return {
                ...state,
                invoicePdfUrl: action.payload.config.url
            };
        case ("EDIT_BASIC_INFO_SUCCESS"):
        
      
            return {
                ...state,
                // userProfile:[]
            };




        default:
            return state;




    }

}

export default AuthenticationReducer