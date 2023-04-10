import { useSelector } from "react-redux";
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
import { useDispatch } from "react-redux";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { authSignOutUser } from "../../redux/auth/authOperations";

import Icon from "react-native-vector-icons/Feather";
import { Feather } from "@expo/vector-icons";

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [userPosts, setUserPosts] = useState(null);
  const [commentsCount, setCommentsCount] = useState({});

  const { login, userId } = useSelector((state) => state.auth);

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

        <View style={styles.imageWrapper}>
          <Image />
          <Image
            source={require("../../../assets/delete-icon.png")}
            style={styles.deleteIcon}
          />
        </View>
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
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: item.photo }}
                      style={styles.imagePosts}
                    />

                    <Text style={styles.title}>{item.formValues.title}</Text>

                    <View style={styles.mapComments}>
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
                          color="#FF6C00"
                          style={styles.commentsIcon}
                        />
                      </TouchableOpacity>
                      <Text style={styles.commentsCount}>
                        {commentsCount[item.id] || 0}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Map", {
                          location: item.location,
                          title: item.formValues.title,
                        })
                      }
                      style={styles.map}
                    >
                      <Feather
                        name="map-pin"
                        size={24}
                        color="#BDBDBD"
                        style={styles.mapIcon}
                      />
                    </TouchableOpacity>

                    <Text style={styles.textMap}>
                      {item.formValues.location}
                    </Text>
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
  imageWrapper: {
    position: "absolute",
    left: "38%",
    top: "-10%",
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },
  deleteIcon: {
    position: "absolute",
    left: "86%",
    top: "60%",
    width: 35,
    height: 35,
  },
  name: {
    fontSize: 30,
    lineHeight: 35,
    textAlign: "center",
    marginTop: 60,
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
    width: 353,
    height: 240,
    borderRadius: 8,
  },
  map: {
    position: "relative",
  },
  mapIcon: {
    position: "absolute",
    top: "-12%",
    left: "77%",
  },
  textMap: {
    flex: 1,
    justifyContent: "space-between",
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    textAlign: "right",
    textDecorationLine: "underline",
  },
  mapComments: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  commentsCount: {
    fontSize: 16,
    lineHeight: 19,
    marginRight: "auto",
    color: "#212121",
  },
});
