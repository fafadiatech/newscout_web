import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import { CardItem, Menu } from 'newscout';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'

class CardList extends React.Component {
	render() {
		return (
			<React.Fragment>
				<Navbar className="fixed-top">
					<NavbarBrand href="/">
						<img src={logo} alt="newscout" />
					</NavbarBrand>
					<Menu />
				</Navbar>
				<div className="container-fluid mt-5">
					<div className="row">
						<div className="col-lg-10 offset-lg-1">
							<ul className="list-inline">
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
								<li className="list-inline-item">
									<div className="card-container">
										<CardItem 
											image="https://image.shutterstock.com/image-photo/colorful-flower-on-dark-tropical-260nw-721703848.jpg"
											title="New Painkiller Rekindles Addiction Concerns"
											description="Maecenas mauris elementum, est morbi interdum cursus at elite imperdiet libero. Proin odios dapibus integer an nulla augue pharetra cursus."
											uploaded_on="3 mins ago"
											uploaded_by="https://www.fafadiatech.com" />
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

const wrapper = document.getElementById("index");
wrapper ? ReactDOM.render(<CardList />, wrapper) : null;