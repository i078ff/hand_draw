import { firebaseConfig } from './firebaseConfig.js';

window.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    // Initialize the FirebaseUI Widget using Firebase.
    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '/home',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.    
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
    };
    // The start method will wait until the DOM is loaded.
    if (location.pathname === '/login') {
        const ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', uiConfig);
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (!user && location.pathname !== '/login') {
            window.location.href = '/login';
        }
    });

    // drawページの保存処理
    // 10秒ごとにcanvasをサーバーに送信
    // 画面を離れるときはめんどそうなのでしない
    // そのうちcanvasに変化があるごとに自動保存に変更する。
    if (location.pathname === '/draw') {
        setInterval(saveCanvas, 10000);
    }


    function saveCanvas() {
        const handCanvasElement = document.getElementById('hand_canvas');
        const handCanvasCtx = handCanvasElement.getContext('2d');
        const data = handCanvasElement.toDataURL();
        console.log(data);
    }
}, false);