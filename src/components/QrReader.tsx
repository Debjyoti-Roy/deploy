import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faRightToBracket,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
// import { Modal } from "react-bootstrap";
import "./LocationReader.css";
import "./QrStyles.css";
import QrScanner from "qr-scanner";
import QrFrame from "../assets/qr-frame.svg";
import tickanimation from "./tickAnimation.json";
import crossanimation from "./crossAnimation.json";
import Lottie from "react-lottie";
import { api, userId } from "../App";
import axios from "axios";
import Typography from "material-ui/styles/typography";
// import { Dialog } from "material-ui";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
} from "@mui/material";

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

const QrReader = ({ handleClose }: { handleClose: () => void }) => {
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);
  const [videoStopped, setVideoStopped] = useState<boolean>(false);
  const [qrData, setQrData] = useState<any>();

  const [scannedResult, setScannedResult] = useState<string | undefined>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tick, setTick] = useState<boolean>(false);
  const [tick2, setTick2] = useState<boolean>(false);
  const [cross, setCross] = useState<boolean>(false);

  const handleButtonClick = async (b: number) => {
    const user = userId();
    const data = {
      user_id: user,
      qr: qrData,
      attendance: b === 1 ? "PUNCH IN" : "PUNCH OUT",
      reason: "",
      gmap_url: "",
      remarks: "",
    };
    try {
      const response = await axios.post(
        api() + "save-attendance-with-qr",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 1) {
        setShowModal(false);
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
        setShowModal(false);
        setCross(true);
        setTimeout(() => {
          setCross(false);
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setShowModal(false);
      setCross(true);

      setTimeout(() => {
        setCross(false);
        handleClose();
      }, 2000);
    }
  };

  const onScanSuccess = (result: QrScanner.ScanResult) => {
    setQrData(result.data);
    setScannedResult(result?.data);
    setShowModal(true);
  };

  const onScanFail = (err: string | Error) => {
    console.log(err);
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,

        overlay: qrBoxEl?.current || undefined,
      });

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    return () => {
      if (!videoEl?.current) {
        scanner?.current?.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!qrOn && !videoStopped)
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
      );
  }, [qrOn, videoStopped]);

  return (
    <>
      {tick && <TickMark />}
      {tick2 && <TickMark3 />}
      {cross && <TickMark2 />}

      <div className="qr-reader" style={{ position: "relative" }}>
        {!scannedResult && qrOn && (
          <>
            <video
              ref={videoEl}
              style={{ position: "absolute", width: "100%", height: "100%" }}
            ></video>
            <div ref={qrBoxEl} className="qr-box">
              <img
                src={QrFrame}
                alt="Qr Frame"
                width={256}
                height={256}
                className="qr-frame"
              />
            </div>
            <FontAwesomeIcon
              icon={faTimes}
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
              onClick={() => {
                scanner.current?.stop();
                scanner.current = undefined;
                setQrOn(false);
                setVideoStopped(true);
                handleClose();
              }}
            />
          </>
        )}
        {scannedResult && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Dialog open={showModal} onClose={handleClose}>
              <DialogTitle
                style={{ backgroundColor: "#3f478f", color: "white" }}
              >
                Choose an Action
              </DialogTitle>
              <DialogContent>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <button
                    className="button location_btn2"
                    onClick={() => handleButtonClick(1)}
                  >
                    <FontAwesomeIcon
                      icon={faRightToBracket}
                      style={{
                        display: "block",
                        margin: "auto",
                        color: "#3f478f",
                      }}
                      size="2x"
                    />
                    Punch In
                  </button>
                  <button
                    className="button location_btn2"
                    onClick={() => handleButtonClick(2)}
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      style={{
                        display: "block",
                        margin: "auto",
                        color: "#3f478f",
                      }}
                      size="2x"
                    />
                    Punch Out
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </>
  );
};

export default QrReader;
// import { useEffect, useRef, useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faRightFromBracket,
//   faRightToBracket,
//   faTimes,
// } from "@fortawesome/free-solid-svg-icons";
// import { Modal } from "react-bootstrap";
// import "./LocationReader.css";
// import "./QrStyles.css";
// import QrScanner from "qr-scanner";
// import QrFrame from "../assets/qr-frame.svg";
// import tickanimation from "./tickAnimation.json";
// import crossanimation from "./crossAnimation.json";
// import Lottie from "react-lottie";
// import { api, userId } from "../App";
// import axios from "axios";

// const TickMark = () => {
//   const defaultOptions = {
//     loop: false,
//     autoplay: true,
//     animationData: tickanimation,
//     rendererSettings: {
//       preserveAspectRatio: "xMidYMid slice",
//     },
//   };
//   return (
//     <div
//       style={{
//         position: "absolute",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         width: "100%",
//         backgroundColor: "white",
//         zIndex: "9999",
//       }}
//     >
//       <div style={{ padding: "42px" }}>
//         <Lottie options={defaultOptions} height={140} width={140} />
//       </div>
//       <h3>Punch In Successfull</h3>
//     </div>
//   );
// };
// const TickMark3 = () => {
//   const defaultOptions = {
//     loop: false,
//     autoplay: true,
//     animationData: tickanimation,
//     rendererSettings: {
//       preserveAspectRatio: "xMidYMid slice",
//     },
//   };
//   return (
//     <div
//       style={{
//         position: "absolute",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         width: "100%",
//         backgroundColor: "white",
//         zIndex: "9999",
//       }}
//     >
//       <div style={{ padding: "42px" }}>
//         <Lottie options={defaultOptions} height={140} width={140} />
//       </div>
//       <h3>Punch Out Successfull</h3>
//     </div>
//   );
// };
// const TickMark2 = () => {
//   const defaultOptions = {
//     loop: false,
//     autoplay: true,
//     animationData: crossanimation,
//     rendererSettings: {
//       preserveAspectRatio: "xMidYMid slice",
//     },
//   };
//   return (
//     <div style={{ height: "100%", width: "100%", backgroundColor: "black" }}>
//       <div
//         style={{
//           position: "absolute",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//           width: "100%",
//           backgroundColor: "white",
//           zIndex: 999,
//         }}
//       >
//         <Lottie options={defaultOptions} height={200} width={200} />
//         <h3>Request Denied</h3>
//       </div>
//     </div>
//   );
// };

// const QrReader = ({ handleClose }: { handleClose: () => void }) => {
//   const scanner = useRef<QrScanner>();
//   const videoEl = useRef<HTMLVideoElement>(null);
//   const qrBoxEl = useRef<HTMLDivElement>(null);
//   const [qrOn, setQrOn] = useState<boolean>(true);
//   const [videoStopped, setVideoStopped] = useState<boolean>(false);
//   const [qrData, setQrData] = useState<any>();

//   const [scannedResult, setScannedResult] = useState<string | undefined>("");
//   const [showModal, setShowModal] = useState<boolean>(false);
//   const [tick, setTick] = useState<boolean>(false);
//   const [tick2, setTick2] = useState<boolean>(false);
//   const [cross, setCross] = useState<boolean>(false);

//   const handleButtonClick = async (b: number) => {
//     const user = userId();
//     const data = {
//       user_id: user,
//       qr: qrData,
//       attendance: b === 1 ? "PUNCH IN" : "PUNCH OUT",
//       reason: "",
//       gmap_url: "",
//       remarks: "",
//     };
//     try {
//       const response = await axios.post(
//         api()+"save-attendance-with-qr",
//         data,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.status === 1) {
//         setShowModal(false);
//         if(b===1){
//           setTick(true);
//           setTimeout(() => {
//             setTick(false);
//             handleClose();
//           }, 2000);
//         }else{
//           setTick2(true);
//           setTimeout(() => {
//             setTick2(false);
//             handleClose();
//           }, 2000);
//         }
//       } else {
//         setShowModal(false);
//         setCross(true);
//         setTimeout(() => {
//           setCross(false);
//           handleClose();
//         }, 2000);
//       }
//     } catch (error) {
//       setShowModal(false);
//       setCross(true);

//       setTimeout(() => {
//         setCross(false);
//         handleClose();
//       }, 2000);
//     }
//   };

//   const onScanSuccess = (result: QrScanner.ScanResult) => {
//     setQrData(result.data);
//     setScannedResult(result?.data);
//     setShowModal(true);
//   };

//   const onScanFail = (err: string | Error) => {
//     console.log(err);
//   };

//   useEffect(() => {
//     if (videoEl?.current && !scanner.current) {
//       scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
//         onDecodeError: onScanFail,
//         preferredCamera: "environment",
//         highlightScanRegion: true,
//         highlightCodeOutline: true,

//         overlay: qrBoxEl?.current || undefined,
//       });

//       scanner?.current
//         ?.start()
//         .then(() => setQrOn(true))
//         .catch((err) => {
//           if (err) setQrOn(false);
//         });
//     }

//     return () => {
//       if (!videoEl?.current) {
//         scanner?.current?.stop();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!qrOn && !videoStopped)
//       alert(
//         "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
//       );
//   }, [qrOn, videoStopped]);

//   return (
//     <>
//       {tick && <TickMark />}
//       {tick2 && <TickMark3 />}
//       {cross && <TickMark2 />}

//       <div className="qr-reader" style={{ position: "relative" }}>
//         {!scannedResult && qrOn && (
//           <>
//             <video
//               ref={videoEl}
//               style={{ position: "absolute", width: "100%", height: "100%" }}
//             ></video>
//             <div ref={qrBoxEl} className="qr-box">
//               <img
//                 src={QrFrame}
//                 alt="Qr Frame"
//                 width={256}
//                 height={256}
//                 className="qr-frame"
//               />
//             </div>
//             <FontAwesomeIcon
//               icon={faTimes}
//               style={{
//                 position: "absolute",
//                 top: "10px",
//                 right: "10px",
//                 border: "none",
//                 background: "none",
//                 color: "black",
//                 fontSize: "24px",
//                 zIndex: 100,
//               }}
//               onClick={() => {
//                 scanner.current?.stop();
//                 scanner.current = undefined;
//                 setQrOn(false);
//                 setVideoStopped(true);
//                 handleClose();
//               }}
//             />
//           </>
//         )}
//         {scannedResult && (
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <Modal
//               show={showModal}
//               onHide={() => {
//                 setShowModal(false);
//                 handleClose();
//               }}
//             >
//               <Modal.Header
//                 onHide={() => handleClose()}
//                 style={{ backgroundColor: "#3f478f" }}
//               >
//                 <Modal.Title style={{ color: "white" }}>
//                   Choose an Action
//                 </Modal.Title>
//               </Modal.Header>
//               <Modal.Body>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <button
//                     className="button location_btn2"
//                     onClick={() => handleButtonClick(1)}
//                   >
//                     <FontAwesomeIcon
//                       icon={faRightToBracket}
//                       style={{
//                         display: "block",
//                         margin: "auto",
//                         color: "#3f478f",
//                       }}
//                       size="2x"
//                     />
//                     Punch In
//                   </button>
//                   <button
//                     className="button location_btn2"
//                     onClick={() => handleButtonClick(2)}
//                   >
//                     <FontAwesomeIcon
//                       icon={faRightFromBracket}
//                       style={{
//                         display: "block",
//                         margin: "auto",
//                         color: "#3f478f",
//                       }}
//                       size="2x"
//                     />
//                     Punch Out
//                   </button>
//                 </div>
//               </Modal.Body>
//             </Modal>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default QrReader;
