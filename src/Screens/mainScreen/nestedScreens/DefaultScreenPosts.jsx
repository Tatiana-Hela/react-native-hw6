import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

import { Feather } from "@expo/vector-icons";

const DefaultScreenPosts = ({ route, navigation }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (route.params) {
      setPosts((prevState) => [...prevState, route.params]);
    }
  }, [route.params]);

  // console.log(posts);
  return (
    <View style={styles.container}>
      <View style={styles.wrapperUser}>
        <Image
          source={require("../../../../assets/images/rectanglex.jpg")}
          style={styles.userPhoto}
        />
        <View style={{ flexDirection: "column" }}>
          <Text style={styles.userName}>Natali Romanova</Text>
          <Text style={styles.userEmail}>email@example.com</Text>
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
              <Text style={styles.title}>{item.title}</Text>
            </View>

            <View style={styles.mapComments}>
              <TouchableOpacity onPress={() => navigation.navigate("Comments")}>
                <Feather
                  name="message-circle"
                  size={18}
                  color="#BDBDBD"
                  style={styles.commentsIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Map")}
                style={styles.map}
              >
                <Feather
                  name="map-pin"
                  size={18}
                  color="#BDBDBD"
                  style={styles.mapIcon}
                />
                <Text style={styles.textMap}>{item.location}</Text>
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
