async function login(email, password, callback) {
  const { FIREBASE_APIKEY, FIREBASE_AUTHDOMAIN, FIREBASE_PROJECTID } = configuration;
  const app = require("firebase");

  const firebaseConfig = {
    apiKey: FIREBASE_APIKEY,
    authDomain: FIREBASE_AUTHDOMAIN,
    projectId: FIREBASE_PROJECTID
  };
  const firebaseApp = app.initializeApp(firebaseConfig);

  firebaseApp.auth().signInWithEmailAndPassword(email, password)
    .then(response => {

      const user = response.user;

      callback(null, {
        user_id: user.uid,
        email: user.email
      });
    })
    .catch(error => {
      return callback(new WrongUsernameOrPasswordError(email));
    });
}
