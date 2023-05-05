import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Platform,
  Image,
  FlatList,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import formatDate from "../../../utils/formatDate";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

const CommentsScreen = ({ route, navigation }) => {
  const [comment, setComment] = useState("");
  const [isShowKeyboard, setIsShowKeyboard] = useState(false);
  const [commentsArr, setCommentsArr] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);

  const { postID, photo } = route.params;
  const { login, userAvatar, userID } = useSelector((state) => state.auth);

  const keyboardHide = () => {
    Keyboard.dismiss();
    setIsShowKeyboard(false);
  };

  const createComment = async () => {
    const date = formatDate(new Date());
    const commentsRef = collection(db, `posts/${postID}/comments`);
    await addDoc(commentsRef, { comment, login, date, userID, userAvatar });
    setComment("");
  };

  const getAllComments = async () => {
    const commentsQuery = query(collection(db, `posts/${postID}/comments`));
    onSnapshot(commentsQuery, async (data) => {
      try {
        const commentsData = [];
        for (const doc of data.docs) {
          const commentData = doc.data();
          console.log("Comment Data:", commentData); // Log the comment data for debugging purposes

          const commentUserID = commentData.userID;
          if (!commentUserID) {
            throw new Error("userID is missing in comments data");
          }

          // Fetch user avatar based on userID from userAvatar collection
          const userAvatarQuery = query(
            collection(db, "userAvatar"),
            where("userID", "==", commentUserID)
          );
          const userAvatarSnapshot = await getDocs(userAvatarQuery);
          if (!userAvatarSnapshot.empty) {
            const userAvatar = userAvatarSnapshot.docs[0].data().userAvatar;
            commentData.userAvatar = userAvatar;
          }

          commentsData.push({ ...commentData, id: doc.id });
        }

        setCommentsArr(commentsData);
        setCommentsCount(commentsData.length);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    });
  };
  useEffect(() => {
    getAllComments();
  }, []);

  useEffect(() => {
    navigation.setParams({ commentsCount: commentsCount });
  }, [commentsCount]);

  return (
    <TouchableWithoutFeedback onPress={keyboardHide}>
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* <ScrollView> */}
        {!isShowKeyboard && (
          <View style={styles.photoWrapper}>
            <Image
              source={{ uri: photo }}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
            />
          </View>
        )}
        
          <FlatList
            data={commentsArr}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View>
                  <Image
                    source={{ uri: item.userAvatar }}
                    style={{
                      width: 50,
                      height: 50,
                      marginRight: 5,
                      borderRadius: "50%",
                    }}
                  />
                </View>
                <View>
                  
                  <View style={styles.commentWrapper}>
                    <Text style={{marginBottom:10}}>{item.login}</Text>
                    <View
                      style={{
                        display: "flex",
                        // flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      
                      <Text style={styles.comments}>{item.comment}</Text>
                    </View>
                    <Text style={styles.commentDate}>{item.date}</Text>
                  </View>
                </View>
              </View>
            )}
            />
            {/* </ScrollView> */}
        </SafeAreaView>
        <View style={{...styles.inputContainer, bottom: isShowKeyboard ? 180 : 0}}>
          <TextInput
            style={styles.input}
            placeholder="Comment..."
            value={comment}
            onChangeText={(value) => setComment(value)}
            onBlur={keyboardHide}
            onFocus={() => setIsShowKeyboard(true)}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={createComment}>
            <Feather name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default CommentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom:80,
  },
  inputContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: 20,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    fontSize: 16,
    lineHeight: 19,
    backgroundColor: "#F6F6F6",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 100,
    height: 50,
    marginLeft: 16,
    color: "#212121",
    paddingBottom: 16,
    paddingLeft: 16,
    paddingTop: 16,
  },
  sendBtn: {
    position: "absolute",
    top: 8,
    left: "92%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6C00",
    borderRadius: 50,
    width: 34,
    height: 34,
  },
  photoWrapper: {
    marginTop: 32,
    marginBottom: 20,
    borderRadius: 8,
    height: 240,
  },
  commentWrapper: {
    maxWidth:320,
    marginBottom: 12,
    marginTop: 12,
    paddingVertical:10,
    paddingHorizontal:16,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 6,
  },

  comments: {
    color: "#212121",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "left",
  },
  commentDate: {
    color: "#BDBDBD",
    fontSize: 10,
    lineHeight: 12,
    textAlign:"right",
  },
});
