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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import formatDate from "../../../utils/formatDate";

import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../../../firebase/config";

const CommentsScreen = ({ route, navigation }) => {
  const [comment, setComment] = useState("");
  const [isShowKeyboard, setIsShowKeyboard] = useState(false);
  const [commentsArr, setCommentsArr] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);

  const { postID, photo } = route.params;
  const { login } = useSelector((state) => state.auth);
  console.log(photo);

  const keyboardHide = () => {
    Keyboard.dismiss();
    setIsShowKeyboard(false);
  };

  const createComment = async () => {
    const date = formatDate(new Date());
    const commentsRef = collection(db, `posts/${postID}/comments`);
    await addDoc(commentsRef, { comment, login, date });
    setComment("");
  };

  const getAllComments = async () => {
    const commentsQuery = query(collection(db, `posts/${postID}/comments`));
    onSnapshot(commentsQuery, (data) => {
      const commentsData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCommentsArr(commentsData);
      setCommentsCount(commentsData.length);
    });
  };

  useEffect(() => {
    getAllComments();
  }, []);

  useEffect(() => {
    // console.log("commentsCount in comments", commentsCount);
    navigation.setParams({ commentsCount: commentsCount });
  }, [commentsCount]);

  return (
    <TouchableWithoutFeedback onPress={keyboardHide}>
      <View style={styles.container}>
        {!isShowKeyboard && (
          <View style={styles.photoWrapper}>
            <Image
              source={{ uri: photo }}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
            />
          </View>
        )}
        <SafeAreaView style={styles.SafeAreaView}>
          <FlatList
            data={commentsArr}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentWrapper}>
                <Text style={styles.comments}>{item.comment}</Text>
                <Text style={styles.commentDate}>{item.date}</Text>
              </View>
            )}
          />
        </SafeAreaView>
        <View style={styles.inputContainer}>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  inputContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    lineHeight: 19,
    marginHorizontal: 16,
    backgroundColor: "#F6F6F6",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 100,
    height: 50,
    color: "#212121",
    paddingBottom: 16,
    paddingLeft: 16,
    paddingTop: 16,
  },
  sendBtn: {
    position: "absolute",
    top: 8,
    left: "85%",
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
    marginHorizontal: 16,
    borderRadius: 8,
    height: 240,
  },
  commentWrapper: {
    marginBottom: 12,
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 6,
  },

  comments: {
    color: "#212121",
    fontSize: 13,
    lineHeight: 18,
  },
  commentDate: {
    color: "#BDBDBD",
    fontSize: 10,
    lineHeight: 12,
    textAlign: "right",
  },
});
