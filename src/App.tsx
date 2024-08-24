import { useEffect, useState } from "react";
import "./App.css";
import QrReader from "./components/QrReader";
import LocationReader from "./components/LocationReader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation, faQrcode, faTimes } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./components/LocationReader.css";
import axios from "axios";

export function userId() {
  return "1";
}
export function api() {
  return "https://server.dweb.co.in/dcpl_erp/";
}

export async function getUserDetails() {
  const url = api() + "get-user-details";
  const data = {
    user_id: userId(),
  };
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, data, { headers });

    return response;
  } catch (error) {
    console.error(error);
  }
}
function App() {
  const [openQr, setOpenQr] = useState<boolean>(false);
  const [openLocation, setOpenLocation] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    getUserDetails().then((d) => {
      const data = {
        name: d?.data.name,
        empId: d?.data.emp_id,
        Branch: d?.data.branch,
        Gate: d?.data.gate,
        Qr: d?.data.qr,
        location: d?.data.location,
      };
      if (data.Qr === 1 && data.location === 1) {
        setShowModal(true);
      } else if (data.Qr === 1) {
        setOpenQr(true);
      } else if (data.location === 1) {
        setOpenLocation(true);
      }
    });
  }, []);

  const handleClose = () => {
    setOpenQr(false);
    setOpenLocation(false);
    setShowModal(true);
  };

  return (
    <div>
      {showModal && (
        <div className="background">
        <div className="choose">
          <button id="onoff" style={{position:'absolute', right:'20px', top:'20px', fontSize: "24px", border: "none",
            background: "none" }}>
          <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className="header">
          <h4>Choose an Action</h4>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            >
            <button
              className="button"
              onClick={() => {
                setOpenQr(true);
                setShowModal(false);
              }}
              >
              <FontAwesomeIcon icon={faQrcode} style={{ marginRight: "5px" }} />
              Scan Qr
            </button>
            <button
              className="button"
              onClick={() => {
                setOpenLocation(true);
                setShowModal(false);
              }}
              >
              <FontAwesomeIcon
                icon={faLocation}
                style={{ marginRight: "5px" }}
                />
              Location
            </button>
          </div>
      </div>
                </div>
      )}
      {openQr && <QrReader handleClose={handleClose} />}
      {openLocation && <LocationReader handleClose={handleClose} />}
    </div>
  );
}

export default App;
