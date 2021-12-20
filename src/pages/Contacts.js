import React, { useContext } from "react";

import {
  Container,
  ListGroup,
  ListGroupItem,
  Spinner,
  Button,
} from "reactstrap";
import Contact from "../components/Contact";
import { MdAdd } from "react-icons/md";
import { useHistory } from "react-router-dom";
import { ContactContext } from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";
import blob1 from "../blob1.svg";
import blob2 from "../blob2.svg";

const Contacts = () => {
  const { state, dispatch } = useContext(ContactContext);

  const { contacts, isLoading } = state;

  const history = useHistory();

  const AddContact = () => {
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null,
    });
    history.push("/contact/add");
  };

  if (isLoading) {
    return (
      <div className="Center">
        <Spinner color="primary" />
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <img src={blob1} alt="blob1" className="cirlce1" />
      <img src={blob2} alt="blob2" className="cirlce2" />

      {contacts.length === 0 && !isLoading ? (
        <div
          className="Center text-large cardtxt"
          style={{ fontWeight: "700", fontSize: "32px", letterSpacing: "2px" }}
        >
          No Contacts found in firebase ...!
        </div>
      ) : (
        <ListGroup>
          {Object.entries(contacts).map(([key, value]) => (
            <ListGroupItem key={key} className="listcard mt-4">
              <Contact contact={value} contactKey={key} />
            </ListGroupItem>
          ))}
        </ListGroup>
      )}
      <Button
        className=" fab sticky-bottom d-print-inline-flex"
        size="lg"
        onClick={AddContact}
      >
        Add Contact
      </Button>
    </Container>
  );
};

export default Contacts;
