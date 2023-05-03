import { auth } from "../../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

import { authSlice } from "./authReducer";

const { updateUserProfile, authStateChange, authSignOut } = authSlice.actions;

export const authSignUpUser =
  ({ login, email, password, avatar }) =>
  async (dispatch, getState) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      const user = await auth.currentUser;
      console.log(user);

      await updateProfile(user, {
        displayName: login,
        photoURL: avatar,
      });

      await onAuthStateChanged(auth, async (user) => {
        if (user) {
          await setDoc(doc(db, "users", user.uid), {
            userId: user.uid,
            login: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: Date.now().toString(),
          });
        }
      });

      const { displayName, uid, photoURL } = await auth.currentUser;

      const userUpdateProfile = {
        userId: uid,
        login: displayName,
        email: email,
        photo: photoURL,
      };

      dispatch(updateUserProfile(userUpdateProfile));
    } catch (error) {
      console.log(error.message);
    }
  };

export const authSignInUser =
  ({ email, password, photo }) =>
  async (dispatch, getState) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      const { uid, displayName, photoURL } = auth.currentUser;
      await dispatch(
        updateUserProfile({
          userId: uid,
          login: displayName,
          photo: photoURL,
        })
      );
    } catch (error) {
      console.log(error.message);
    }
  };
export const authSignOutUser = () => async (dispatch, getState) => {
  try {
    await auth.signOut();
    dispatch(authSignOut());
  } catch (error) {
    console.log(error.message);
  }
};

export const authStateChangeUser = () => async (dispatch, getState) => {
  await onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(user);
      const userUpdateProfile = {
        userId: user.uid,
        login: user.displayName,
        email: user.email,
        photo: user.photoURL,
      };

      dispatch(updateUserProfile(userUpdateProfile));
      dispatch(authStateChange({ stateChange: true }));
    }
  });
};

export const authEditProfile =
  ({ photo }) =>
  async (dispatch) => {
    try {
      await updateProfile(auth.currentUser, {
        photoURL: photo,
      });

      await onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = await doc(db, "users", user.uid);
          await setDoc(userRef, { photoURL: photo }, { merge: true });
        }
      });

      const { uid, displayName, photoURL } = auth.currentUser;
      await dispatch(
        authSlice.actions.updateUserProfile({
          userId: uid,
          login: displayName,
          photo: photoURL,
        })
      );
    } catch (error) {
      console.log(error);
    }
  };
