import React, { Component } from 'react'
import { Form, Input, Button, Checkbox } from 'antd';
import AuthenticationService from '../SignUp/AuthenticationService'
import { connect } from 'react-redux'
import { getUserProfile, loginAction } from '../actions/AuthenticationActions'
import { withRouter } from 'react-router-dom';
import classes from '../Authentication.less'
import intl from 'react-intl-universal';
import 'antd/dist/antd.less';
import CommonModal from '../../../Common/ConfirmModal/CommonModal';
import jwt_decode from "jwt-decode";
import { motion } from 'framer-motion';
import { baseVariants } from '../../../Animation';
class Login extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoggedIn: false,
            disableLogin: true
        }
    }

    componentDidUpdate(prevProps) {
        console.log(prevProps.isLoggedIn);
        console.log(this.props.isLoggedIn);
        if (prevProps.isLoggedIn !== this.props.isLoggedIn) {
            console.log('did up date');
        }

    }


    onFinish = async (values) => {
        const { getUserProfile } = this.props
        const { username, password, remember } = values

        try {
            console.log('login now !!!!!');
            let res = await AuthenticationService
                .executeJwtAuthenticationService(username, password)
            console.log(res);
            if (res.data.detail === "USER_DISABLED") {

                CommonModal.error({
                    content:"Please activate your account by completing email verification"
                })

            }else if(res.data.detail ==="INVALID_CREDENTIALS"){
                    console.log('getting "INVALID_CREDENTIALS" ');
                CommonModal.error({
                    content:"Invalid username/password"
                })

            }

            else {
                let token = res.data.token
                AuthenticationService.registerSuccessfulLoginForJwt(username, token)
                let isLoggedIn = AuthenticationService.isUserLoggedIn()
                console.log('isLoggedIn ', isLoggedIn);
                this.props.loginAction(isLoggedIn)
                this.props.history.push('/inventory')
            }



        } catch (error) {


        }





    };

    onFinishFailed = errorInfo => {

    };

    onFieldsChange = (changedFields, allFields) => {

        let bothFieldsFilled = allFields.every(f => f.value !== undefined && f.value !== "");

        if (bothFieldsFilled)
            this.setState({ disableLogin: false })
        else
            this.setState({ disableLogin: true })
    }


    render() {

        const layout = {
            labelCol: {
                span: 8,
            },
            wrapperCol: {
                span: 16,
            },
        };
        const tailLayout = {
            wrapperCol: {
                offset: 8,
                span: 16,
            },
        };
        const { disableLogin } = this.state


        return (
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={baseVariants}
                className={classes.loginFormContainer}>

                <h1 style={{ color: "white" }}>{intl.get('signin')}</h1>
                <Form
                    {...layout}
                    name="basic"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    onFieldsChange={this.onFieldsChange}
                >
                    <Form.Item
                        label={"username"}
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={"password"}
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>


                    <Form.Item {...tailLayout}>
                        <Button disabled={disableLogin} type="primary" htmlType="submit">
                            {intl.get('login')}
                        </Button>
                    </Form.Item>
                </Form>

            </motion.div>
        )
    }
}



const mapStateToProps = (state) => {


    return {
        isLoggedIn: state.AuthenticationReducer.isLoggedIn
    }
}

const mapDispatchToProps = (dispatch) => {

    return {
        loginAction: (isLoggedIn) => dispatch(loginAction(isLoggedIn)),
        getUserProfile: (payload) => dispatch(getUserProfile(payload))
    }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))
