import style from "./dashboard.module.css";
import { useState, useRef , useEffect } from "react";
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
    const [userHistory, setUserHistory] = useState([]);
    
    useEffect(() => {
        async function fetchData() {
            try {
                // Call the fetchUserData function to fetch user data
                const userData = await fetchUserData(data.email);
                setUserHistory(userData); // Update user history state
                console.log(userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        fetchData(); // Call the fetchData function when the component mounts
    }, [data.email]); // Run the effect whenever data.email changes

    // Define the fetchUserData function to fetch user data
    const fetchUserData = async (email) => {
        try {
            // Create a new FormData instance
            const formData = new FormData();
            formData.append("email", data.email);

            // Make a POST request to the API endpoint
            const response = await axios.post('http://localhost:5000/fetch_data', formData);
            // Return the response data
            console.log(response.data);
            return response.data;
        } catch (error) {
            // Handle any errors
            console.error('Error fetching user data:', error);
            return null; // or throw error
        }
    };

    function getImageType(base64Data) {
        const base64Header = base64Data.substring(0, 30); // Get the first 30 characters of the base64 data
        const typeMatch = base64Header.match(/^data:image\/(.*);base64,/); // Match the MIME type header
        if (typeMatch && typeMatch[1]) {
            return typeMatch[1]; // Return the image type
        }
        return null; // Return null if the type cannot be determined
    }
    
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
                                <p>{item.label}: {item.score * 100}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Display images and their scores */}
            <h1 className={style.previousUploadsHeading}>Your Previous Uploads</h1>
            <div className={style.imageScoreContainer}>
                {userHistory.map((imageData, index) => (
                    <div key={index} className={style.imageScoreItem}>
                        {/* Decode base64 image data and set it as src */}
                        <img src={`data:image/jpeg;base64, ${imageData.image_data}`} className={style.f} alt={`Image ${index + 1}`} />
                        {imageData.classifications.map((classification, cIndex) => (
                            <p key={cIndex}>
                                Classification Type: {classification.classification_type}<br />
                                Fake Score: {classification.fake_score * 100}<br />
                                Real Score: {classification.real_score * 100}
                            </p>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}
