import style from "./dashboard.module.css";
import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import plus from "../../image/plus.svg";
import axios from "axios";
import { supabase } from "../../utils/supabase";

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;
    const filePickerRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [confScore, setConfScore] = useState(null);

    function selectImage(e) {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        setSelectedImage(files[0]);
    }
    function checkConfScore() {
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("email", data.email);
        axios
            .post("http://localhost:5000/predict", formData)
            .then((res) => {
                console.log(res.data);
                setConfScore(res.data.confidence_score);
            })
            .catch((err) => {
                console.log(err);
            });
    }
    async function logOut() {
        await supabase.auth.signOut();
        navigate('/');
    }
    return (
        <>
            <header className={style.header}>
                <h1>Dashboard</h1>
                <div>
                    <h3>Hey {data.email}</h3>
                    <button className={style.logout} onClick={() => logOut()}>Log Out</button>
                </div>
            </header>
            <input
                type='file'
                accept='image/*'
                ref={filePickerRef}
                onChange={(e) => selectImage(e)}
            />
            <div className={style.dashboardContainer}>
                <div className={style.imageContainer}>
                    {!selectedImage ? (
                        <div className={style.imageLoader}>
                            <img
                                style={{ height: "200px", width: "200px" }}
                                onClick={() => filePickerRef.current.click()}
                                src={plus}
                                alt="Upload Image"
                            />
                            <p
                                style={{ marginTop: "10px", fontSize: "15px", color: "#000" }}
                                onClick={() => filePickerRef.current.click()}
                            >
                                Upload Image
                            </p>

                        </div>
                    ) : (
                        <div className={style.imageLoader}>
                            <img src={URL.createObjectURL(selectedImage)} alt="Uploaded" onClick={() => filePickerRef.current.click()} style={{ height: "200px", width: "200px" }} />
                        </div>
                    )}
                    <button className={style.button} onClick={() => checkConfScore()}>Check</button>
                </div>
                <div className={style.resultContainer}>
                    Predictions:
                    <div className={style.predictionResults}>
                        {confScore && confScore.map((item, index) => (
                            <div key={index}>
                                <p>{item.label}: {item.score}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
