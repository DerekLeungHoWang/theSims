import React, { Component } from 'react'
import { List, Card, Col, Row } from 'antd';
import { connect } from 'react-redux';


class DataBoxes extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }

    getCategoryLength = () => {
        return this.props.inventoryList.reduce((acc, curr) => {
            let isElemExist = acc.findIndex((item) => {
                return item.category === curr.category;
            })
            if (isElemExist === -1) {
                let obj = {};
                obj.category = curr.category;
                obj.count = 1;
                acc.push(obj)
            } else {
                acc[isElemExist].count += 1
            }
            return acc;

        }, []).length
    }

    render() {
        const gridStyle = {
            width: '100%',
            height: 150,
            textAlign: 'center',

        };




        return (
            <div>

                <Card   >
                    <Row>
                        <Col xs={24} sm={24} xl={6} >
                            <Card.Grid style={gridStyle}><h1>{this.getCategoryLength()}</h1> <p>Category</p></Card.Grid>
                        </Col>
                        <Col xs={24} sm={24} xl={6}   >
                            <Card.Grid style={gridStyle}><h1>{this.props.inventoryList.length}</h1> <p>Products</p></Card.Grid>
                        </Col>
                        <Col xs={24} sm={24} xl={6}  >
                            <Card.Grid style={gridStyle}><h1>0</h1> <p>Total Revenue</p></Card.Grid>
                        </Col>
                        <Col xs={24} sm={24} xl={6}  >
                            <Card.Grid style={gridStyle}><h1>0</h1> <p>Total Cost</p></Card.Grid>
                        </Col>
                    </Row>
                </Card>

            </div>
        )
    }
}

const mapStateToProps = (state) => {


    return {
        inventoryList: state.InventoryReducer.inventoryList,
        isFetching: state.LoadingReducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataBoxes)
