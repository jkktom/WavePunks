import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from "react-router-bootstrap";

const Tabs = () => {
  return (
    <Nav variant="pills" defaultActiveKey="/" className='justify-content-center my-4'>
      <LinkContainer to="/">
        <Nav.Link>Mint</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/offer">
        <Nav.Link>Create Offer</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/borrow">
        <Nav.Link>Borrow</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/status">
        <Nav.Link>Lending status</Nav.Link>
      </LinkContainer>
    </Nav>
  );
}

export default Tabs;
