import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const CommentsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Comment..." />
        <TouchableOpacity style={styles.sendBtn}>
          <Feather name="arrow-up" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
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
    background: "#F6F6F6",
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
    left:'85%',
    justifyContent:"center",
    alignItems:"center",
    backgroundColor: "#FF6C00",
    borderRadius: 50,
    width: 34,
    height: 34,
  },
});
