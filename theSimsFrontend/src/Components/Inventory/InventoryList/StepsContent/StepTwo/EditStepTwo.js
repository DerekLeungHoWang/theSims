import React, { Component } from 'react'
import { connect } from 'react-redux';
import { savePreviewList } from '../../../action/InventoryAction';
import TweenOne from 'rc-tween-one';
import classes from '../../../Inventory.less';
import { Form, Input, Button, Checkbox } from 'antd';
import PreviewTable from './PreviewTable';
import Animate from 'rc-animate';
import styles from './Animation.less'
import cloneDeep from 'lodash/cloneDeep';
import intl from 'react-intl-universal';
import _ from 'lodash'
import CreateProductPreview from './CreateProductPreview'


const layout = {
    labelCol: {
        span: 10,
    },
    wrapperCol: {
        span: 16,
    },
    layout: "inline"
};
const tailLayout = {
    // wrapperCol: {
    //     offset: 4,
    //     span: 4,
    // },
};

class EditStepTwo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showAnimation: true,
            addToAllValue: 0,
            previewList: [],
            undoAdded: false,
            isValueChanged:false
        }
    }
    formRef = React.createRef();

   
    componentDidMount() {
        this.props.onRef(this)
        const { inventoryList,selectedRowKeys,selectedRows } = this.props
       
        // 
        
        const previewList = cloneDeep(inventoryList);
       
        previewList.forEach((item) => {
            item.remaining += this.state.addToAllValue
        })
      let filteredPreviewList =   previewList.filter(p=>{
          return  selectedRows.some(s=>{     
                return p.id===s.id
            })
        })
 
        this.setState(({
            previewList:filteredPreviewList,
            isValueChanged:false
        }))
    }

    
    

    componentDidUpdate(prevProps, prevState) {

        if (prevProps.inventoryList !== this.props.inventoryList) {
           
            this.setState({
                undoAdded: false
            })
            //this.formRef.current.resetFields()
        }
      

        if (prevState.previewList !== this.state.previewList) {


            //If user did change any of the values -> return true
            //If at the end values are the same as intital values for whatever reasons -> return false
            const isValueChanged =  this.props.inventoryList.filter(prev=>
                  this.state.previewList.some(curr=> curr.remaining===prev.remaining)
            ).length==0
            
            this.setState({isValueChanged})


          
        }
        

    }

    onFinish = values => {
        const { inventoryList, savePreviewList } = this.props
        const { previewList } = this.state
        const { undoAdded } = this.state
        const valueToAdd = parseInt(values.addToAll)
        const updatedPreviewList = cloneDeep(previewList);
        
        if (!_.isUndefined(valueToAdd) && !undoAdded) {

            updatedPreviewList.forEach((item) => {
                item.remaining += valueToAdd
            })
            this.setState({
                previewList: updatedPreviewList,
                undoAdded: !this.state.undoAdded
            })
        } else if (undoAdded) {
            updatedPreviewList.forEach((item) => {
                item.remaining -= valueToAdd
            })
            this.setState({
                previewList: updatedPreviewList,
                undoAdded: !this.state.undoAdded
            })
        }
 
        savePreviewList(updatedPreviewList)


    };
    onPreview = () => {
        this.setState({
            showAnimation: !this.state.showAnimation,
        });
    }

    onFinishFailed = errorInfo => {

    };

    handleInputChange = e => {

        const { savePreviewList } = this.props
        const { previewList } = this.state
        let inputValue = parseInt(e.target.value)
        let id = e.target.id
        this.setState(prevState => ({
            previewList: prevState.previewList.map(
                obj => {

                    return obj.id == id ? Object.assign(obj, { remaining: inputValue }) : obj
                }
            )
        }));

        savePreviewList(previewList)
    }

    getForm = () => {
        
        const { showAnimation, undoAdded } = this.state
        return (<Form
            {...layout}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            name="editProductsStepTwo"
            ref={this.formRef}
        >
            <Form.Item
                label="Add to All"
                name="addToAll"
                rules={[{ required: true, message: 'Please input a number' }]}
            >
                <Input
                    placeholder="number"
                    type="number"
                    disabled={undoAdded ? true : false}
                />

            </Form.Item>
            <Form.Item >
                <Button type={undoAdded ? "danger" : "primary"} htmlType="submit">
                    {undoAdded ? intl.get('inventory.undo') : intl.get('inventory.add')}
                </Button>
            </Form.Item>
            <Form.Item >

                <Button type="primary" onClick={this.onPreview}>
                    {showAnimation ? ' Hide ' : 'Preview'}
                </Button>


            </Form.Item>
        </Form>
        )
    }


    renderScreen = () => {
        const { inventoryList, updatePreviewList,stepTwoContent } = this.props
        const { showAnimation, addToAllValue, previewList } = this.state
        const addToAllInput = this.getForm()
        
        if(stepTwoContent==="createProduct"){
            return <CreateProductPreview/>
        }else{
            return (<div className={classes.stepTwoContainer} >
                {addToAllInput}
                <Animate
                    transitionName={{
                        enter: styles['fade-enter'],
                        enterActive: styles['fade-enter-active'],
                        leave: styles['fade-leave'],
                        leaveActive: styles['fade-leave-active'],
                        appear: styles['fade-appear'],
                        appearActive: styles['fade-appear-active']
                    }}
                    transitionAppear
                >
                    {showAnimation && <PreviewTable
                        key="previewTable"
                        previewList={previewList}
                        addToAllValue={addToAllValue}
                        handleInputChange={this.handleInputChange}
                    />}
                </Animate>
            </div>)

        }
    }

    render() {



        return (
            this.renderScreen()
        );
    }
}


const mapStateToProps = (state) => {


    return {
        updatePreviewList: state.InventoryReducer.previewList,

    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        savePreviewList: (updatedPreviewList) => { dispatch(savePreviewList(updatedPreviewList)) }

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditStepTwo)
