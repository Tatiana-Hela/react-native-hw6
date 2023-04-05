import { View, Text, StyleSheet, TextInput } from "react-native";

const CommentsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View>
        <TextInput style={styles.input} placeholder="Comment..." />
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
  },
  input: {
    fontSize: 16,
    lineHeight: 19,
    width:343,
    marginHorizontal: 16,
    background: "#F6F6F6",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 100,
    height: 50,
    color: "#212121",
    paddingBottom: 16,
    paddingLeft: 16,
    paddingTop:16,
  },
});
