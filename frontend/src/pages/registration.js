import React,{useState} from "react";
import { ReactDOM} from "react";
import "../css/registrationPage.css"
import {initializeApp} from "firebase/app"
import { Navigate, useNavigate } from "react-router-dom";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth"
import {addDoc, getFirestore, collection, getDocs, query, where, onSnapshot, setDoc, doc, updateDoc} from "firebase/firestore"
import forge from "node-forge"
import AlertBox from "../components/alertBox";




const firebaseConfig = {
    apiKey: "AIzaSyA-EBrDm3FjdRmjwAQGU_1ocSKYoGN-BYQ",
    authDomain: "ce4010-project.firebaseapp.com",
    projectId: "ce4010-project",
    storageBucket: "ce4010-project.appspot.com",
    messagingSenderId: "332473893693",
    appId: "1:332473893693:web:08ba18e137a40f3edb7b54",
    measurementId: "G-Z7W69JFQ20"
  };

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

const auth = getAuth(app)

export default function() {

    const navigate = useNavigate()

    const [showAlert, setShowAlert] = useState(false)
    const [wrongCredential, setWrongCredential] = useState(false)
    const [generating, setGenerating] = useState(false)

    function register(event) {
        event.preventDefault()
        var username = event.target.username.value
        var password = event.target.password.value
        setGenerating(true)

        createUserWithEmailAndPassword(auth, username + "@test.com", password)
        .then((userCredential) => {
            var rsa = forge.pki.rsa
            var keypair = rsa.generateKeyPair({bits: 2048, e:0x10001})
            var n = (keypair.publicKey.n).toString()
            var e = (keypair.publicKey.e).toString()
            const rsaPrivateKey = keypair.privateKey

            var jsonKey = JSON.stringify({
                privateKeyPem: forge.pki.privateKeyToPem(rsaPrivateKey)
            })

            localStorage.setItem(username, jsonKey)

    
            console.log('generated')
            setDoc(doc(db, "users", username), 
            {online: false,
             publicKeyN: n,  
             publicKeyE: e, 
             inbox: []})

            navigate("../home", {state: {username:username}})
         
        })

    }

    function login(event) {
        event.preventDefault()
        var username = event.target.username.value
        var password = event.target.password.value

        signInWithEmailAndPassword(auth, username + "@test.com", password)
        .then((userCredential) => {
            const user = userCredential.user
        //console.log(user)
        if(localStorage.getItem(username) === null){
            setShowAlert(true)
        } else {
            navigate("../home", {state: {username:username}})
        }
        }).catch(() => {
            setWrongCredential(true)
        })

    }

    const [registered, setRegistered] = useState(true)
    return (
        <div className="registrationPage">
            <AlertBox trigger={generating} onClickFunction={()=> {setGenerating(!showAlert)}}>
                Registering and Generating RSA keys. Please wait
            </AlertBox>

            <AlertBox trigger={showAlert} onClickFunction={()=> {setShowAlert(!showAlert)}}>
            Error! Please use the same device as where this account was made
            </AlertBox>


            <AlertBox trigger={wrongCredential} onClickFunction={()=> {setWrongCredential(!wrongCredential)}}>
            Error! Wrong credentials used
            </AlertBox>
            
            <div className="registrationFormWrapper">
            <form className="registrationForm" onSubmit={(registered)?login:register}>
                <h1>Welcome</h1>  
                <input type='text' placeholder='username' name="username"></input>
                <input type = 'password' placeholder="password" name="password"></input>
                
                {(!registered)? 
                <input type = 'submit' value="register" ></input>:
                <input type = 'submit' value="login" ></input>
                }

            
            </form>
            <button onClick={() => {
                setRegistered(!registered)
            }}>{(registered)? "register":"login"}</button>

            </div>
            
        </div>
    )
}