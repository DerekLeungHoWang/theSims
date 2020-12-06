import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Spin, List, Avatar, Button, Skeleton, Input } from 'antd';
import { useDispatch, useSelector } from "react-redux"
import { fetchAllProducts, addToCart } from '../../actions/productActions';
import { Link } from 'react-router-dom';
import classes from '../../ProductMainPage.less'
const { Meta } = Card;

const Displayproducts = (props) => {

    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const isLoading = useSelector(state => {
        return state.ProductReducer.isLoading
    });
    const productList = useSelector(state => state.ProductReducer.productList);


    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAllProducts())
    }, []);


    const renderProductScreen = () => {
        return productList.map(item => {

            console.log(item);
            return (
                <Col xs={24} sm={24} sm={12} md={8} xl={6}  span={6} >
                    <Link to={`/product/${item.id}`}>
                        <Card
                            hoverable
                            cover={<img
                                className={classes.productNamePriceContainerImg}
                                alt="example"
                                src="https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" />}
                            className={classes.productNamePriceContainer}
                        >

                            <Meta
                                title={item.productName}
                                description={`$${item.basePrice}`} />

                        </Card>
                    </Link>
                </Col>
            )
        })

    }


    //productNamePriceContainer
    // <Link to={`/product/${item.id}`}>{item.productName}</Link>

    return (
        <div className={classes.displayProductOuterContainer}>
            <Spin spinning={isLoading} >
                <Row gutter={[8, 8]} >

                    {renderProductScreen()}

                </Row>
            </Spin>

        </div>
    )
}

Displayproducts.propTypes = {

}

export default Displayproducts
