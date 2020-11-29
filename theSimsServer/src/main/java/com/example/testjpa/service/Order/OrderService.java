package com.example.testjpa.service.Order;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.testjpa.model.Users;
import com.example.testjpa.model.Order.Orders;
import com.example.testjpa.model.Order.OrdersProduct;
import com.example.testjpa.model.inventory.Product;
import com.example.testjpa.repository.Order.OrderRepository;

@Service
@Transactional
public class OrderService {
	private Logger logger = LoggerFactory.getLogger(this.getClass());
	@Autowired
	OrderRepository orderRepository;

	@Autowired
	EntityManager em;

	public List<Orders> getAll() {
		List<Orders> ordersList = orderRepository.findAll();

		return ordersList;
	}

	public Map<String, Object> addOrder(Map<String, Object> req) {

		Long userId = ((Integer) req.get("userId")).longValue();
		Users specificUser = em.find(Users.class, userId);

		System.out.println("does the user have order already: => {} " + specificUser.getOrders().size());
		boolean isOrderExist = specificUser.getOrders().size() != 0;

		if (isOrderExist) {
			System.out.println("Order id already exist, not adding new one, should merge ");
			List<Orders> orderList = specificUser.getOrders();
			Orders oldOrder = orderList.stream().findFirst().get();

			Product product = em.find(Product.class, ((Integer) req.get("productId")).longValue());
			Long productId = ((Integer) req.get("productId")).longValue();
			boolean isProductExist = oldOrder.getOrderProductList().stream()
					.anyMatch(e -> e.getProduct().getId().equals(productId));
			System.out.println("isProductExist => " + isProductExist);

			if (isProductExist) {
				System.out.println("producst alread exist, should append to current product");
				int quantity2 = ((Integer) req.get("quantity")).intValue();
				System.out.println("quantity 2 => " + quantity2);
				OrdersProduct oldOrderedProduct = oldOrder.getOrderProductList().stream()
						.filter(e -> e.getProduct().getId().equals(productId)).collect(Collectors.toList()).get(0);

				int newQuantity = oldOrderedProduct.getQuantity() + quantity2;

				System.out.println("newQuantity ==>" + newQuantity);
				oldOrderedProduct.setQuantity(newQuantity);
				
				
				int newSum = 0;
				List<OrdersProduct> oldProductsList = oldOrder.getOrderProductList();
				for (OrdersProduct o : oldProductsList) {
					System.out.println("olddSum" + o.getQuantity() * o.getProduct().getBasePrice());
					newSum += o.getQuantity() * o.getProduct().getBasePrice();
				}
				oldOrder.setTotal(newSum);
				em.persist(oldOrder);

			} else {

				System.out.println("new Products need to be added");
				OrdersProduct osp = new OrdersProduct();
				int quantity1 = ((Integer) req.get("quantity")).intValue();
				osp.setQuantity(quantity1);
				osp.setProduct(product);
				osp.setOrders(oldOrder);
				oldOrder.addProductToList(osp);

				int newSum = 0;

				List<OrdersProduct> oldProductsList = oldOrder.getOrderProductList();

				for (OrdersProduct o : oldProductsList) {

					System.out.println("olddSum" + o.getQuantity() * o.getProduct().getBasePrice());
					newSum += o.getQuantity() * o.getProduct().getBasePrice();
				}

				oldOrder.setTotal(newSum);

				System.out.println("newSum 92  => " + newSum);
				em.persist(oldOrder);
			}

		} else {
			Orders newOrders = new Orders();
			List<OrdersProduct> ordersProductList = new ArrayList<>();
			OrdersProduct newOrdersProduct1 = new OrdersProduct();

			Long productId = ((Integer) req.get("productId")).longValue();
			int quantity1 = ((Integer) req.get("quantity")).intValue();

			newOrdersProduct1.setQuantity(quantity1);
			newOrdersProduct1.setProduct(em.find(Product.class, productId));
			newOrdersProduct1.setOrders(newOrders);

			System.out.println("new Orders Product=>{}" + newOrdersProduct1);
			ordersProductList.add(newOrdersProduct1);

			System.out.println(req.get("status").toString());
			newOrders.setUsers(specificUser);
			newOrders.setStatus(req.get("status").toString());
			newOrders.setOrderProductList(ordersProductList);

			int newSum = newOrdersProduct1.getProduct().getBasePrice() * newOrdersProduct1.getQuantity();
			newOrders.setTotal(newSum);

			System.out.println("newSum 120  => " + newSum);
			em.persist(newOrders);
		}

		Map<String, Object> userOrder = this.getOrderByUserId(userId);

		return userOrder;
	}

	public Map<String, Object> getOrderById(Long id) {

		Orders specificOrder = orderRepository.findById(id).orElse(null);

		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("id", specificOrder.getId());
		resultMap.put("status", specificOrder.getStatus());
		resultMap.put("userName", specificOrder.getUsers().getUsername());
		resultMap.put("orderProductList", specificOrder.getOrderProductList());

		return resultMap;
	}

	public Map<String, Object> getOrderByUserId(Long id) {
		Orders specificOrder = orderRepository.findOrdersByUsersId(id);

		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("id", specificOrder.getId());
		resultMap.put("status", specificOrder.getStatus());
		resultMap.put("userId", specificOrder.getUsers().getId());
		resultMap.put("userName", specificOrder.getUsers().getUsername());
		resultMap.put("orderProductList", specificOrder.getOrderProductList());
		resultMap.put("total", specificOrder.getTotal());
		System.out.println(resultMap);
		return resultMap;
	}

	public Map<String, Object> removeOneProduct(Map<String, Object> req) {

		Long userId = ((Integer) req.get("userId")).longValue();

		Long reqPrdocutId = ((Integer) req.get("productId")).longValue();

		Orders specificOrder = orderRepository.findOrdersByUsersId(userId);

		if (specificOrder.getOrderProductList().size() == 1) {
			System.out.println("ONLY ONE PRODUCT REMAINS => size " + specificOrder.getOrderProductList().size());
			specificOrder.getOrderProductList().stream().forEach(e -> System.out.println(e.getProduct().getId()));
			OrdersProduct productToBeRemoved = specificOrder.getOrderProductList().stream()
					.filter(e -> e.getProduct().getId().equals(reqPrdocutId)).findFirst().get();
			System.out.println("GETTING");
			specificOrder.removeProductFromList(productToBeRemoved);
			
			
			em.remove(specificOrder);

			return null;
		} else {
			System.out.println("MORE THEN ONE REMAINS");
			specificOrder.getOrderProductList().stream().forEach(e -> System.out.println(e.getProduct().getId()));
			OrdersProduct productToBeRemoved = specificOrder.getOrderProductList().stream()
					.filter(e -> e.getProduct().getId().equals(reqPrdocutId)).findFirst().get();

			specificOrder.removeProductFromList(productToBeRemoved);
			
			int newSum = 0;

			List<OrdersProduct> oldProductsList = specificOrder.getOrderProductList();

			for (OrdersProduct o : oldProductsList) {

				System.out.println("olddSum" + o.getQuantity() * o.getProduct().getBasePrice());
				newSum += o.getQuantity() * o.getProduct().getBasePrice();
			}

			specificOrder.setTotal(newSum);
			
			
			
			
			
			
			em.merge(specificOrder);
			Map<String, Object> userOrder = this.getOrderByUserId(userId);
			
			
			
			
			
			return userOrder;
		}

	}

	public Map<String, Object> changeStatus(Long id, String status) {

		System.out.println("id ==> " + id);
		Orders targetOrder = em.find(Orders.class, id);
		System.out.println("order = > " + targetOrder.toString());
		targetOrder.setStatus(status);
		em.merge(targetOrder);

		return null;
	}

}
