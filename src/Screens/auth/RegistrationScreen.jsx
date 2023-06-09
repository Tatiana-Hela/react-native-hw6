import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import { nanoid } from "nanoid";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";

import { authSignUpUser } from "../../redux/auth/authOperations";

import { storage } from "../../firebase/config";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

import {
  loginValidation,
  passwordValidation,
  emailValidation,
} from "../../shared/validation";

SplashScreen.preventAutoHideAsync();

const initialState = {
  login: "",
  email: "",
  password: "",
  userAvatar: null,
};

const RegistrationScreens = ({ navigation }) => {
  const [isShowKeyboard, setIsShowKeyboard] = useState(false);
  const [state, setState] = useState(initialState);
  const [isFocus, setIsFocus] = useState({
    login: false,
    email: false,
    password: false,
  });
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fontsLoaded] = useFonts({
    "Roboto-Regular": require("../../../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("../../../assets/fonts/Roboto-Medium.ttf"),
  });
  const [isSecureEntry, setIsSecureEntry] = useState(true);

  const dispatch = useDispatch();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  function submitForm() {
    if (
      loginValidation(state) &&
      passwordValidation(state) &&
      emailValidation(state)
    ) {
      console.log("state in register", state);
      const formData = { ...state };
      dispatch(authSignUpUser(formData));
      setState(initialState);
    } else return;
  }

  async function handleImageUpload() {
    // request to access image download
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // open gallery to select photo
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const imageUrl = result.assets[0].uri;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        // download selected photo
        const avatarID = nanoid();
        const avatarRef = ref(storage, `temp/${avatarID}`);
        await uploadBytes(avatarRef, blob);
        const downloadURL = await getDownloadURL(avatarRef);
        // additional code for setting avatar
        setState((prevState) => ({ ...prevState, userAvatar: downloadURL }));
        Alert.alert("Successfully uploaded");
      } catch (error) {
        console.error(error);
        Alert.alert("Error uploading image");
      }
    }
  }
  function removeUserAvatarFromRegisterScreen() {
    setState((prevState) => ({ ...prevState, userAvatar: null }));
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <ImageBackground
          style={styles.image}
          source={require("../../../assets/images/photo-bg2x.jpg")}
        >
          <View style={styles.wrapperForm}>
            {state.userAvatar ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: state.userAvatar }}
                  style={styles.imageUser}
                />
                <TouchableOpacity
                  onPress={removeUserAvatarFromRegisterScreen}
                  style={styles.deleteIcon}
                >
                  <Image source={require("../../../assets/delete-icon.png")} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageWrapper}>
                <TouchableOpacity
                  onPress={handleImageUpload}
                  style={styles.addIcon}
                >
                  <Image source={require("../../../assets/add.png")} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.form}>
              <View>
                <Text style={styles.title}>Registration</Text>
              </View>
              <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : "height"}
              >
                <View
                  style={{
                    paddingBottom:
                      isFocus.email || isFocus.password || isFocus.login
                        ? 80
                        : 0,
                  }}
                >
                  <TextInput
                    onFocus={() => {
                      setIsShowKeyboard(true);
                      setIsFocus({ ...isFocus, login: true });
                    }}
                    onBlur={() => {
                      setIsFocus({ ...isFocus, login: false });
                    }}
                    placeholderTextColor="#BDBDBD"
                    placeholder="Login"
                    value={state.login}
                    onChangeText={(value) =>
                      setState((prevState) => ({ ...prevState, login: value }))
                    }
                    style={{
                      ...styles.input,
                      borderColor: isFocus.login ? `#FF6C00` : `#E8E8E8`,
                    }}
                  />
                  <TextInput
                    keyboardType="email-address"
                    onFocus={() => {
                      setIsShowKeyboard(true);
                      setIsFocus({ ...isFocus, email: true });
                    }}
                    onBlur={() => {
                      setIsFocus({ ...isFocus, email: false });
                    }}
                    placeholder="E-mail address"
                    value={state.email}
                    onChangeText={(value) =>
                      setState((prevState) => ({ ...prevState, email: value }))
                    }
                    style={{
                      ...styles.input,
                      borderColor: isFocus.email ? `#FF6C00` : `#E8E8E8`,
                    }}
                  />
                  <View>
                    <TextInput
                      onFocus={() => {
                        setIsShowKeyboard(true);
                        setIsFocus({ ...isFocus, password: true });
                      }}
                      onBlur={() => {
                        setIsFocus({ ...isFocus, password: false });
                      }}
                      placeholder="Password"
                      value={state.password}
                      onChangeText={(value) =>
                        setState((prevState) => ({
                          ...prevState,
                          password: value,
                        }))
                      }
                      secureTextEntry={isSecureEntry}
                      style={{
                        ...styles.input,
                        borderColor: isFocus.password ? `#FF6C00` : `#E8E8E8`,
                      }}
                    />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.textPassword}
                      onPress={() => {
                        setIsSecureEntry((prevState) => !prevState);
                      }}
                    >
                      <Text>{isSecureEntry ? "Show" : "Hide"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={submitForm}
                style={styles.button}
              >
                <Text style={styles.textButton}>Register</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text
                style={styles.textLink}
                onPress={() => navigation.navigate("Login")}
              >
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default RegistrationScreens;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-end",
  },
  title: {
    textAlign: "center",
    fontFamily: "Roboto-Medium",
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: 0.01,
    color: "#212121",
    marginBottom: 27,
  },
  input: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
    height: 50,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    color: "#212121",
  },
  wrapperForm: {
    paddingBottom: 45,
    paddingTop: 92,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  form: {
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: "#FF6C00",
    borderRadius: 100,
    height: 51,
    marginTop: 43,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  textButton: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
  },
  textLink: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
    textAlign: "center",
    color: "#1B4371",
  },
  imageUser: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  deleteIcon: {
    position: "absolute",
    left: "86%",
    top: "60%",
    width: 25,
    height: 25,
  },
  imageWrapper: {
    position: "absolute",
    left: "35%",
    top: "-15%",
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },
  addIcon: {
    position: "absolute",
    left: "90%",
    top: "65%",
    width: 25,
    height: 25,
  },
  textPassword: {
    position: "absolute",
    top: "50%",
    left: "85%",
    color: "#1B4371",
    fontSize: 16,
    lineHeight: 19,
  },
});
