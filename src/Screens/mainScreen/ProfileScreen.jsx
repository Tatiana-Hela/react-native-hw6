import { useSelector ,useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  where,
} from "firebase/firestore";

import { db, storage } from "../../firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "@firebase/storage";
import {
  authSignOutUser,
  authEditProfile,
} from "../../redux/auth/authOperations";
import * as ImagePicker from "expo-image-picker";

import Icon from "react-native-vector-icons/Feather";
import { Feather } from "@expo/vector-icons";

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [selectedImg, setSelectedImg] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPosts, setUserPosts] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (!selectedImg) {
      setSelectedImg(photo);
    }
  }, []);

  useEffect(() => {
    if (currentAvatar !== null && currentAvatar !== photo) {
      uploadPhotoToServer();
    }
  }, [currentAvatar]);

  const { login, userId, photo } = useSelector((state) => state.auth);

  const downloadPhoto = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImg(result.assets[0].uri);
        setCurrentAvatar(result.assets[0].uri);
      }
    } catch (E) {
      console.log(E);
    }
  };

  const uploadPhotoToServer = async () => {
    try {
      setLoading(true);
      const response = await fetch(selectedImg);
      const file = await response.blob();
      const uniquePhotoId = Date.now().toString();

      const storageRef = ref(storage, `avatar/${uniquePhotoId}`);
      const result = await uploadBytesResumable(storageRef, file);
      const processedPhoto = await getDownloadURL(storageRef);
      await dispatch(authEditProfile({ photo: processedPhoto }));
      setLoading(false);
      return processedPhoto;
    } catch (error) {
      console.log("error:", error);
    }
  };

  const clearPhoto = () => {
    setSelectedImg(null);
  };

  useEffect(() => {
    if (route.params?.commentsCount) {
      setCommentsCount((prev) => ({
        ...prev,
        [route.params.postID]: route.params.commentsCount,
      }));
    }
  }, [route.params]);

  const getCommentsCount = async (postID) => {
    try {
      const commentsRef = collection(db, `posts/${postID}/comments`);
      const queryRef = query(commentsRef);
      const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        const commentsCount = querySnapshot.docs.length;
        setCommentsCount((prev) => ({ ...prev, [postID]: commentsCount }));
        console.log("PostID", postID);
      });
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
      setCommentsCount((prev) => ({ ...prev, [postID]: 0 }));
    }
  };

  const getUserPosts = async () => {
    try {
      const userPostsRef = collection(db, "posts");
      const queryRef = query(userPostsRef, where("userId", "==", userId));
      const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        const userPosts = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUserPosts(userPosts);

        if (userPosts && userPosts.length > 0) {
          userPosts.forEach((post) => {
            getCommentsCount(post.id.toString());
          });
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = () => {
    dispatch(authSignOutUser());
  };
  useEffect(() => {
    getUserPosts();
    return () => getUserPosts();
  }, []);

  return (
    <ImageBackground
      style={styles.image}
      source={require("../../../assets/images/photo-bg2x.jpg")}
    >
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={signOut}>
          <Feather
            style={styles.logout}
            name="log-out"
            size={24}
            color="#BDBDBD"
          />
        </TouchableOpacity>

        {selectedImg ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedImg }} style={styles.imageUser} />
            <TouchableOpacity onPress={clearPhoto} style={styles.deleteIcon}>
              <Image source={require("../../../assets/delete-icon.png")} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageWrapper}>
            <TouchableOpacity onPress={downloadPhoto} style={styles.addIcon}>
              <Image source={require("../../../assets/add.png")} />
            </TouchableOpacity>
          </View>
        )}
        <View>
          <Text style={styles.name}>{login}</Text>
        </View>
        {userPosts && userPosts.length > 0 && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={userPosts}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      marginBottom: 30,
                    }}
                  >
                    <Image
                      source={{ uri: item.photo }}
                      style={styles.imagePosts}
                    />
                    <Text style={styles.title}>{item.formValues.title}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 11,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("Comments", {
                              postID: item.id,
                              photo: item.photo,
                            })
                          }
                        >
                          <Icon
                            name="message-circle"
                            size={24}
                            color={
                              commentsCount[item.id] > 0 ? "#FF6C00" : "#BDBDBD"
                            }
                          />
                        </TouchableOpacity>
                        <Text style={styles.commentsCount}>
                          {commentsCount[item.id] || 0}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("Map", {
                              location: item.location,
                              title: item.formValues.title,
                            })
                          }
                        >
                          <Feather name="map-pin" size={24} color="#BDBDBD" />
                        </TouchableOpacity>
                        <Text style={styles.locationText}>
                          {item.formValues.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  );
};
export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
    resizeMode: "contain",
    justifyContent: "flex-end",
    // alignItems: "center",
  },
  wrapper: {
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    marginTop: 119,
    height: 500,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
    left: "38%",
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
  name: {
    fontSize: 30,
    lineHeight: 35,
    textAlign: "center",
    marginTop: 32,
    marginBottom: 33,
    color: "#212121",
  },
  logout: {
    marginLeft: "auto",
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    marginRight: "auto",
    marginTop: 8,
  },
  imagePosts: {
    width: "100%",
    height: 240,
    borderRadius: 8,
  },
  commentsCount: {
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    marginLeft: 9,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    marginLeft: 8,
    textDecorationLine: "underline",
  },
});
