import React, { useState, useContext, useEffect } from "react";
import firebase from "firebase/app";

import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col,
} from "reactstrap";

import { readAndCompressImage } from "browser-image-resizer";

import { imageConfig } from "../utils/config";

import { MdAddCircleOutline } from "react-icons/md";

import { v4 } from "uuid";

import { ContactContext } from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";

import { useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import usericon from "../usericon.svg";

import blob1 from "../blob1.svg";
import blob2 from "../blob2.svg";

const AddContact = () => {
  const { state, dispatch } = useContext(ContactContext);

  const { contactToUpdate, contactToUpdateKey } = state;

  const history = useHistory();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [star, setStar] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (contactToUpdate) {
      setName(contactToUpdate.name);
      setEmail(contactToUpdate.email);
      setPhoneNumber(contactToUpdate.phoneNumber);
      setAddress(contactToUpdate.address);
      setStar(contactToUpdate.star);
      setDownloadUrl(contactToUpdate.picture);

      setIsUpdate(true);
    }
  }, [contactToUpdate]);

  const imagePicker = async (e) => {

    try {
      const file = e.target.files[0];

      var metadata = {
        contentType: file.type,
      };

      let resizedImage = await readAndCompressImage(file, imageConfig);

      const storageRef = await firebase.storage().ref();
      var uploadTask = storageRef
        .child("images/" + file.name)
        .put(resizedImage, metadata);

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          setIsUploading(true);
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
              setIsUploading(false);
              console.log("UPloading is paused");
              break;
            case firebase.storage.TaskState.RUNNING:
              console.log("UPloading is in progress...");
              break;
          }
          if (progress === 100) {
            setIsUploading(false);
            toast("uploaded", { type: "success" });
          }
        },
        (error) => {
          toast("something is wrong in state change", { type: "error" });
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then((downloadURL) => {
              setDownloadUrl(downloadURL);
            })
            .catch((err) => console.log(err));
        }
      );
    } catch (error) {
      console.error(error);
      toast("Something went wrong", { type: "error" });
    }
  };

  const addContact = async () => {
    try {
      firebase
        .database()
        .ref("contacts/" + v4())
        .set({
          name,
          email,
          phoneNumber,
          address,
          picture: downloadUrl,
          star,
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updateContact = async () => {

    try {
      firebase
        .database()
        .ref("contacts/" + contactToUpdateKey)
        .set({
          name,
          email,
          phoneNumber,
          address,
          picture: downloadUrl ? downloadUrl : null,
          star,
        });
    } catch (error) {
      console.log(error);
      toast("Oppss.. you forgot to upload photo", { type: "error" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isUpdate ? updateContact() : addContact();

    toast("Contacts Updated", { type: "success" });
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null,
    });

    history.push("/");
  };

  return (
    <Container fluid className="mt-5 ">
      <img src={blob1} alt="blob1" className="cirlce6" />
      <img src={blob2} alt="blob2" className="cirlce7" />
      <Row>
        <Col md="8" className="offset-md-2 p-3 ">
          <Form className="formcard mb-5" onSubmit={handleSubmit}>
            <div className="text-center">
              {isUploading ? (
                <Spinner type="grow" color="primary" />
              ) : (
                <div className="">
                  <label htmlFor="imagepicker" className="">
                    <img
                      src={downloadUrl ? downloadUrl : usericon}
                      alt=""
                      className="profile"
                    />
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="imagepicker"
                    accept="image/*"
                    multiple={false}
                    onChange={(e) => imagePicker(e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <FormGroup className="mt-4">
              <input
                className="input"
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <input
                className="input mt-2"
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </FormGroup>
            <FormGroup>
              <input
                className="input mt-2 mb-2"
                type="number"
                name="number"
                id="phonenumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="phone number"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="textarea"
                name="area"
                id="area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="address"
                className="input"
              />
            </FormGroup>
            <FormGroup check className="mt-2">
              <Label check>
                <Input
                  className="checkmark"
                  type="checkbox"
                  onChange={() => {
                    setStar(!star);
                  }}
                  checked={star}
                />{" "}
                <span
                  className="text-right"
                  style={{
                    color: "#f9f9f9",
                    fontWeight: "400",
                    letterSpacing: "1px",
                  }}
                >
                  Mark as Star
                </span>
              </Label>
            </FormGroup>
            <Button
              type="submit"
              color="primary"
              block
              className="text-uppercase button mt-5"
              style={{
                padding: "15px",
                fontSize: "18px",
              }}
            >
              {isUpdate ? "Update Contact" : "Add Contact"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddContact;
