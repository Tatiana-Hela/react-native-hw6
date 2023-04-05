import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../../../firebase/config";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

import { Feather } from "@expo/vector-icons";

const DefaultScreenPosts = ({ navigation }) => {
  const [posts, setPosts] = useState([]);

  const { email, login } = useSelector((state) => state.auth);

  const getAllPost = async () => {
    try {
      onSnapshot(collection(db, "posts"), (data) => {
        const posts = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setPosts(posts);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllPost();
  }, []);

  console.log(posts);
  return (
    <View style={styles.container}>
      <View style={styles.wrapperUser}>
        <Image
          source={require("../../../../assets/images/rectanglex.jpg")}
          style={styles.userPhoto}
        />
        <View style={{ flexDirection: "column" }}>
          <Text style={styles.userName}>{login}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item, indx) => indx.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              marginBottom: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.wrapper}>
              <Image source={{ uri: item.photo }} style={styles.image} />
              <Text style={styles.title}>{item.formValues.title}</Text>
            </View>

            <View style={styles.mapComments}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Comments", {
                    postID: item.id,
                    photo: item.photo,
                  })
                }
              >
                <Feather
                  name="message-circle"
                  size={18}
                  color="#BDBDBD"
                  style={styles.commentsIcon}
                />
              </TouchableOpacity>

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
                  size={18}
                  color="#BDBDBD"
                  style={styles.mapIcon}
                />
                <Text style={styles.textMap}>{item.formValues.location}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};
export default DefaultScreenPosts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    marginRight: "auto",
    marginTop: 8,
  },
  image: { width: 353, height: 240, borderRadius: 8 },
  map: {
    position: "relative",
  },
  mapIcon: {
    position: "absolute",
  },
  textMap: {
    flex: 1,
    justifyContent: "space-between",
    marginLeft: 20,
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    textAlign: "right",
    textDecorationLine: "underline",
  },
  mapComments: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 353,
  },

  wrapper: {
    width: 353,
  },
  wrapperUser: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
    width: 353,
  },
  userPhoto: {
    marginRight: 8,
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
    alignItems: "flex-start",
  },
  userName: {
    fontSize: 13,
    lineHeight: 15,
    color: "#212121",
  },
  userEmail: {
    fontSize: 11,
    lineHeight: 13,
    color: "rgba(33, 33, 33, 0.8)",
  },
});
