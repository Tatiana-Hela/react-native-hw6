import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import { Camera } from "expo-camera";
import * as Location from "expo-location";

import { Feather, FontAwesome } from "@expo/vector-icons";

import { storage } from "../../firebase/config";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";

const CreatePostsScreen = ({ navigation }) => {
  const [camera, setCamera] = useState(null);
  const [photo, setPhoto] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [formValues, setFormValues] = useState({ title: "", location: "" });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFocus, setIsFocus] = useState({
    title: false,
    location: false,
  });

  const { userID, login } = useSelector((state) => state.auth);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        console.log("Camera permission denied");
      } else {
        console.log("Camera permission granted");
      }
    };

    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
      } else {
        console.log("Location permission granted");
      }
    };

    if (Platform.OS === "android" && !Constants.isDevice) {
      console.log("Location permission denied because emulator has no GPS");
    } else {
      requestLocationPermission();
    }

    requestCameraPermission();
  }, []);

  const getLocationAddress = async (latitude, longitude) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
        language: "en",
      });
      console.log(address);
      if (address) {
        const locationAddress = `${address.city}, ${address.country}`;
        const translationResponse = await axios.get(
          `https://translate.google.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(
            locationAddress
          )}`
        );
        const translatedAddress = translationResponse.data[0][0][0];
        setLocationAddress(translatedAddress);
        setFormValues({ location: translatedAddress });
      } else {
        console.log("No address found");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const cleanPhoto = () => {
    setPhoto("");
    setFormValues({ title: "", location: "" });
  };

  const takePhoto = async () => {
    if (camera && isCameraReady) {
      try {
        const photo = await camera.takePictureAsync();
        console.log("photo", photo.uri);
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setPhoto(photo.uri);
        getLocationAddress(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error("Failed to take photo", error);
      }
    } else {
      console.log("Camera is not ready yet");
    }
  };

  const uploadPostToServer = async () => {
    const photo = await uploadPhotoToServer();
    try {
      const db = getFirestore();
      const newCollectionRef = collection(db, "posts");
      await addDoc(newCollectionRef, {
        userID,
        login,
        photo,
        formValues,
        location: location.coords,
      });
      console.log(`The collection was created successfully!`);
    } catch (error) {
      console.error(error.message);
    }
  };

  const uploadPhotoToServer = async () => {
    try {
      const response = await fetch(photo);
      const file = await response.blob();
      const uniquePostId = Date.now().toString();
      const storageRef = ref(storage, `postImage/${uniquePostId}`);
      await uploadBytes(storageRef, file);
      const processedPhoto = await getDownloadURL(storageRef);
      console.log("processedPhoto", processedPhoto);
      return processedPhoto;
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (formValues.title && formValues.location && photo) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formValues]);

  const sendPhoto = () => {
    navigation.navigate("DefaultScreen");
    cleanPhoto();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Camera
          type={type}
          style={styles.camera}
          ref={(ref) => setCamera(ref)}
          onCameraReady={handleCameraReady}
        >
          {photo && (
            <View style={styles.takePhotoContainer}>
              <Image
                source={{ uri: photo }}
                style={{ height: "100%", width: "100%" }}
              />
            </View>
          )}
          <TouchableOpacity
            style={{
              ...styles.cameraBtn,
              backgroundColor: !photo ? `#FFFFFF` : `rgba(255, 255, 255, 0.3)`,
            }}
            onPress={takePhoto}
          >
            <FontAwesome
              name="camera"
              size={24}
              style={{
                color: !photo ? `#BDBDBD` : `#FFFFFF`,
              }}
            />
          </TouchableOpacity>
        </Camera>
        {!photo ? (
          <Text style={styles.text}>Upload photo</Text>
        ) : (
          <Text style={styles.text}>Edit photo</Text>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
        >
          <View
            style={{
              paddingBottom: isFocus.location || isFocus.title ? 20 : 0,
            }}
          >
            <TextInput
              onFocus={() => setIsFocus({ ...isFocus, title: true })}
              onBlur={() => setIsFocus({ ...isFocus, title: false })}
              placeholder="Name..."
              value={formValues.title}
              onChangeText={(value) =>
                setFormValues({ ...formValues, title: value })
              }
              style={{
                ...styles.input,
                borderBottomColor: isFocus.title ? `#FF6C00` : `#E8E8E8`,
              }}
            />
            <View style={styles.inputMapWrapper}>
              <Feather
                name="map-pin"
                size={18}
                color="#BDBDBD"
                style={styles.mapIcon}
              />
              <TextInput
                onFocus={() => setIsFocus({ ...isFocus, location: true })}
                onBlur={() => setIsFocus({ ...isFocus, location: false })}
                placeholder="Location..."
                value={formValues.location}
                onChangeText={(value) =>
                  setFormValues({ ...formValues, location: value })
                }
                style={{
                  ...styles.inputMap,
                  borderBottomColor: isFocus.location ? `#FF6C00` : `#E8E8E8`,
                }}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, !isFormValid && styles.disabledButton]}
            onPress={() => {
              if (isFormValid) {
                uploadPostToServer();
                sendPhoto();
              }
            }}
          >
            <Text
              style={{
                ...styles.textButton,
                color: isFormValid ? "#FFFFFF" : "#BDBDBD",
              }}
            >
              Publish
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={cleanPhoto}>
            <Feather name="trash-2" size={24} color="#BDBDBD" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CreatePostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  camera: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    height: 240,
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    overflow: "hidden",
  },
  cameraBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: "50%",
  },
  takePhotoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  text: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 19,
    color: "#BDBDBD",
  },
  input: {
    marginTop: 32,
    fontSize: 16,
    lineHeight: 19,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  button: {
    backgroundColor: "#FF6C00",
    borderRadius: 100,
    height: 51,
    marginTop: 32,
    marginBottom: 86,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#F6F6F6",
  },
  textButton: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
  },
  inputMapWrapper: {
    position: "relative",
  },
  mapIcon: {
    position: "absolute",
    top: 24,
  },
  inputMap: {
    marginTop: 10,
    paddingLeft: 20,
    fontSize: 16,
    lineHeight: 19,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  deleteBtn: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 70,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
  },
});
