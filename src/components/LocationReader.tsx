import { ChangeEvent, useEffect, useState } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import { Style, Icon } from "ol/style";
import Geolocation from "ol/Geolocation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faRightFromBracket,
  faRightToBracket,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./LocationReader.css";
import tickanimation from "./tickAnimation.json";
import crossanimation from "./crossAnimation.json";
import Lottie from "react-lottie";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { api, getUserDetails, userId } from "../App";
import axios from "axios";

const locations = ["BPC", "HWH", "KOL", "VISIT", "WFH"];
const reasons = [
  "NEW CLIENT",
  "SALES FOLLOW-UP",
  "PAYMENT COLLECTION",
  "DOCUMENT COLLECTION",
  "DELIVERY",
  "SUPPORT",
];
const remarks = [
  "LATE ENTRY WITH APPROVAL",
  "LATE ENTRY WITH HALF DAY WORK",
  "EARLY CHECKOUT WITH PERMISSION",
  "EARLY CHECKOUT WITH NO APPROVAL",
];

interface Errors {
  reason?: string;
  remark?: string;
}

const TickMark = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: tickanimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: "white",
        zIndex: "9999",
      }}
    >
      <div style={{ padding: "42px" }}>
        <Lottie options={defaultOptions} height={140} width={140} />
      </div>
      <h3>Punch In Successfull</h3>
    </div>
  );
};
const TickMark3 = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: tickanimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: "white",
        zIndex: "9999",
      }}
    >
      <div style={{ padding: "42px" }}>
        <Lottie options={defaultOptions} height={140} width={140} />
      </div>
      <h3>Punch Out Successfull</h3>
    </div>
  );
};

const TickMark2 = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: crossanimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "black" }}>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          backgroundColor: "white",
          zIndex: 999,
        }}
      >
        <Lottie options={defaultOptions} height={200} width={200} />
        <h3>Request Denied</h3>
      </div>
    </div>
  );
};
const LocationReader = ({ handleClose }: { handleClose: () => void }) => {
  const [map, setMap] = useState<OlMap>();
  const [geolocation, setGeolocation] = useState<Geolocation>();
  const [show, setShow] = useState<boolean>(false);
  const [tick, setTick] = useState<boolean>(false);
  const [tick2, setTick2] = useState<boolean>(false);
  const [cross, setCross] = useState<boolean>(false);
  const [location, setLocation] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [visit, setVisit] = useState<boolean>(false);

  const [url, setUrl] = useState<any>("");

  const handlemodal = () => {
    setShow(!show);
  };

  useEffect(() => {
    getUserDetails().then((d) => {
      setLocation(d?.data.branch);
    });
    const initialMap = new OlMap({
      target: undefined,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new OlView({
        center: [0, 0],
        zoom: 2,
      }),
    });

    setMap(initialMap);

    const geo = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: initialMap.getView().getProjection(),
    });

    setGeolocation(geo);
  }, []);

  useEffect(() => {
    if (!map || !geolocation) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUrl(
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        );
        geolocation.setTracking(true);
        geolocation.on("change:position", () => {
          const coordinates = geolocation.getPosition();
          setShow(true);
          if (coordinates) {
            map.getView().animate({ center: coordinates, zoom: 19 });
            const marker = new Feature({
              geometry: new Point(coordinates),
            });

            marker.setStyle(
              new Style({
                image: new Icon({
                  src: "https://openlayers.org/en/latest/examples/data/icon.png",
                }),
              })
            );

            const vectorLayer = new VectorLayer({
              source: new VectorSource({
                features: [marker],
              }),
            });

            map.addLayer(vectorLayer);
          }
        });
      });
    }
  }, [map, geolocation]);

  useEffect(() => {
    if (!map) return;

    map.setTarget("map");

    return () => map.setTarget(undefined);
  }, [map]);

  const handleLocationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
    const loc=event.target.value
    if (loc.toLowerCase() === "visit") {
      setVisit(true);
    } else {
      setVisit(false);
    }
  };

  const handleReasonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setReason(event.target.value);
  };

  const handleRemarkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRemark(event.target.value);
  };

  const handleClick = async (b: number) => {
    let errors: Errors = {};

    if (location === "VISIT" && !reason) {
      errors.reason = "Reason for visit is required";
    }
const now = new Date();
const currentTime = now.getHours()*60 + now.getMinutes();
const startTime=11*60+45;
const endTime= 18*60+45;
    if (!remark &&  (currentTime >= startTime && currentTime <= endTime)) {
      errors.remark = "Remark is required";
    }

    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      const data = {
        user_id: userId(),
        branch: location,
        gate: "",
        attendance: b === 1 ? "PUNCH IN" : "PUNCH OUT",
        reason: reason,
        gmap_url: url,
        remarks: remark,
      };
      try {
        const response = await axios.post(api() + "save-attendance", data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.data.status === 1) {
          if (b === 1) {
            setTick(true);
            setTimeout(() => {
              setTick(false);
              handleClose();
            }, 2000);
          } else {
            setTick2(true);
            setTimeout(() => {
              setTick2(false);
              handleClose();
            }, 2000);
          }
        } else {
          setCross(true);
          setTimeout(() => {
            setCross(false);
            handleClose();
          }, 2000);
        }
      } catch (error) {
        setCross(true);

        setTimeout(() => {
          setCross(false);
          handleClose();
        }, 2000);
      }
    }
  };

  return (
    <>
      {tick && <TickMark />}
      {tick2 && <TickMark3 />}
      {cross && <TickMark2 />}
      <div style={{ height: "100vh", backgroundColor: "black" }}>
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            border: "none",
            background: "none",
            color: "black",
            fontSize: "24px",
            zIndex: 100,
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div
          id="map"
          style={{ width: "100%", height: show ? "80vh" : "100vh" }}
        />
        {!show && (
          <>
            <div className="Up">
              <FontAwesomeIcon
                icon={faChevronUp}
                onClick={() => setShow(true)}
                size="2x"
                color="#495057"
              />
            </div>
          </>
        )}
        {show && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "50vh",
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderTopRightRadius: "20px",
              borderTopLeftRadius: "20px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                height: "60px",
                backgroundColor: "#3f478f",
                width: "100%",
                borderTopRightRadius: "20px",
                borderTopLeftRadius: "20px",
              }}
            >
              <h4
                style={{
                  color: "white",
                  position: "absolute",
                  top: "15px",
                  left: "20px",
                }}
              >
                Choose an Action
              </h4>
              <button
                onClick={handlemodal}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "20px",
                  border: "none",
                  background: "none",
                  color: "white",
                  fontSize: "24px",
                  zIndex: 100,
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                marginTop: "50px",
              }}
            >
              <div className="mb-2">
                <strong>Location</strong>
                <ToggleButtonGroup
                  type="radio"
                  name="locations"
                  value={location}
                  style={{ width: "100%" }}
                >
                  {locations.map((loc, idx) => (
                    <ToggleButton
                      id={`toggle-${idx}`}
                      onChange={handleLocationChange}
                      key={idx}
                      value={loc}
                      variant="outline"
                      style={{
                        backgroundColor: location === loc ? "#3f478f" : "",
                        borderColor: location === loc ? "#3f478f" : "#3f478f",
                        color: location === loc ? "white" : "",
                      }}
                    >
                      {loc}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>

              <div>
                {visit && (
                  <div className="mb-2">
                    <label>
                      <strong>Select Reason for Visit</strong>
                    </label>
                    <select
                      className="form-control"
                      value={reason}
                      onChange={handleReasonChange}
                    >
                      <option value="">Select Reason for Visit</option>
                      {reasons.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {errors.reason && (
                      <p style={{ color: "red" }}>{errors.reason}</p>
                    )}
                  </div>
                )}
               {/* {visit && (  */}
                <div>

                
                <label>
                  <strong>Select Remark</strong>
                </label>
                <select
                  className="form-control"
                  value={remark}
                  onChange={handleRemarkChange}
                >
                  <option value="">Select Remark</option>
                  {remarks.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.remark && (
                  <p style={{ color: "red" }}>{errors.remark}</p>
                )}
                </div>
                {/* )} */}
              </div>
              <div style={{ display: "flex", gap: "5px", marginTop: "1vh" }}>
                <button className="button2" onClick={() => handleClick(1)}>
                  <FontAwesomeIcon
                    icon={faRightToBracket}
                    style={{ color: "#3f478f", marginRight: "5px" }}
                  />
                  Punch In
                </button>
                <button className="button2" onClick={() => handleClick(2)}>
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    style={{ color: "#3f478f", marginRight: "5px" }}
                  />
                  Punch Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LocationReader;
